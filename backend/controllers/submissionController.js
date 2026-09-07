const Submission = require('../models/Submission');
const FormSchema = require('../models/FormSchema');
const { validateResponses, calculateProgress } = require('../utils/validateAgainstSchema');
const { asyncHandler } = require('../middleware/errorHandler');

async function getForm(formId, userId) {
  const form = await FormSchema.findOne({ formId, $or: [{ createdBy: null }, { createdBy: userId }] });
  if (!form) {
    const error = new Error('Form not found');
    error.statusCode = 404;
    throw error;
  }
  return form;
}

function snapshot(form) {
  return {
    formId: form.formId,
    title: form.title,
    description: form.description,
    version: form.version,
    fields: form.fields,
    sections: form.sections
  };
}

const create = asyncHandler(async (req, res) => {
  const form = await getForm(req.body.formId, req.userId);
  const values = validateResponses(req.body.values || {}, form, false);
  const aiAssistedFields = Array.isArray(req.body.aiAssistedFields)
    ? req.body.aiAssistedFields.filter((name) => form.fields.some((field) => field.name === name))
    : [];

  const submission = await Submission.create({
    userId: req.userId,
    formId: form.formId,
    formVersion: form.version,
    formSnapshot: snapshot(form),
    values,
    aiAssistedFields,
    currentStep: Math.max(0, Number(req.body.currentStep) || 0)
  });

  res.status(201).json({ success: true, data: submission });
});

const list = asyncHandler(async (req, res) => {
  const query = { userId: req.userId };
  if (req.query.status && ['draft', 'submitted', 'under_review', 'completed'].includes(req.query.status)) {
    query.status = req.query.status;
  }
  const rows = await Submission.find(query).sort({ updatedAt: -1 }).limit(200);
  res.json({ success: true, data: rows });
});

const get = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({ _id: req.params.id, userId: req.userId });
  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
  res.json({ success: true, data: submission });
});

const update = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({ _id: req.params.id, userId: req.userId });
  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
  if (submission.status !== 'draft') return res.status(400).json({ success: false, message: 'Only drafts can be edited' });

  const form = submission.formSnapshot || await getForm(submission.formId, req.userId);
  const values = validateResponses(req.body.values === undefined ? submission.values : req.body.values, form, false);
  submission.values = values;

  if (req.body.currentStep !== undefined) {
    submission.currentStep = Math.max(0, Number(req.body.currentStep) || 0);
  }
  if (Array.isArray(req.body.aiAssistedFields)) {
    submission.aiAssistedFields = req.body.aiAssistedFields.filter((name) =>
      (form.fields || []).some((field) => field.name === name)
    );
  }

  await submission.save();
  res.json({
    success: true,
    data: { ...submission.toObject(), progress: calculateProgress(values, form) }
  });
});

const remove = asyncHandler(async (req, res) => {
  const submission = await Submission.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
    status: 'draft'
  });
  if (!submission) return res.status(404).json({ success: false, message: 'Draft not found' });
  res.json({ success: true, message: 'Draft deleted' });
});

const submit = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({ _id: req.params.id, userId: req.userId });
  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
  if (submission.status !== 'draft') return res.status(400).json({ success: false, message: 'Submission is already finalized' });

  const form = submission.formSnapshot || await getForm(submission.formId, req.userId);
  const values = validateResponses(submission.values, form, true);

  // Atomically transition draft -> submitted. This makes a double-click or
  // duplicate request harmless even if both requests reach the API together.
  const updated = await Submission.findOneAndUpdate(
    { _id: submission._id, userId: req.userId, status: 'draft' },
    { $set: { values, status: 'submitted', submittedAt: new Date(), updatedAt: new Date() } },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(409).json({ success: false, message: 'Submission is already finalized' });
  }

  res.json({ success: true, data: updated });
});

module.exports = { create, list, get, update, remove, submit };
