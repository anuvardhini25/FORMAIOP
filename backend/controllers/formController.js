const FormSchema = require('../models/FormSchema');
const { asyncHandler } = require('../middleware/errorHandler');
const allowedTypes = new Set(['text', 'textarea', 'number', 'email', 'date', 'select', 'radio', 'checkbox']);

const normalize = (form) => {
  const object = form.toObject ? form.toObject() : form;
  if ((!object.fields || !object.fields.length) && object.sections?.length) object.fields = object.sections.flatMap((section) => section.fields || []);
  if (!object.sections?.length) object.sections = [{ title: 'Form', description: '', order: 0, fields: object.fields || [] }];
  return object;
};

function canAccess(form, user) {
  return !form.createdBy || String(form.createdBy) === String(user._id) || user.role === 'admin';
}

function validateDefinition(body) {
  const fields = Array.isArray(body.fields) ? body.fields : (body.sections || []).flatMap((section) => section.fields || []);
  if (!body.formId || !/^[a-z0-9][a-z0-9_-]*$/.test(body.formId)) return 'formId must use lowercase letters, numbers, hyphens or underscores';
  if (!String(body.title || '').trim()) return 'title is required';
  if (!fields.length) return 'at least one field is required';

  const names = fields.map((field) => String(field.name || '').trim());
  if (names.some((name) => !name)) return 'every field must have a name';
  if (new Set(names).size !== names.length) return 'field names must be unique';
  for (const field of fields) {
    if (!allowedTypes.has(field.type)) return `Invalid field type for ${field.name}`;
    if (['select', 'radio'].includes(field.type)) {
      if (!Array.isArray(field.options) || !field.options.length || new Set(field.options).size !== field.options.length || field.options.some((option) => !String(option).trim())) {
        return `${field.name} must have unique options`;
      }
    }
    if (field.showIf && (!names.includes(field.showIf.field) || !['equals', 'notEquals', 'contains'].includes(field.showIf.operator))) return `Invalid conditional rule for ${field.name}`;
  }
  return null;
}

const list = asyncHandler(async (req, res) => {
  const forms = await FormSchema.find({ $or: [{ createdBy: null }, { createdBy: req.userId }] }).sort({ updatedAt: -1 });
  res.json({ success: true, data: forms.map(normalize) });
});

const getForm = asyncHandler(async (req, res) => {
  const form = await FormSchema.findOne({ formId: req.params.formId });
  if (!form || !canAccess(form, req.user)) return res.status(404).json({ success: false, message: 'Form not found' });
  res.json({ success: true, data: normalize(form) });
});

const createForm = asyncHandler(async (req, res) => {
  const validationError = validateDefinition(req.body || {});
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  if (await FormSchema.exists({ formId: req.body.formId })) return res.status(409).json({ success: false, message: 'formId already exists' });
  const form = await FormSchema.create({ ...req.body, createdBy: req.userId });
  res.status(201).json({ success: true, data: normalize(form) });
});

const updateForm = asyncHandler(async (req, res) => {
  const old = await FormSchema.findOne({ formId: req.params.formId });
  if (!old || !canAccess(old, req.user)) return res.status(404).json({ success: false, message: 'Form not found' });
  const validationError = validateDefinition({ ...req.body, formId: old.formId });
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  const form = await FormSchema.findOneAndUpdate(
    { formId: old.formId },
    { ...req.body, formId: old.formId, createdBy: old.createdBy, version: (old.version || 1) + 1 },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: normalize(form) });
});

const duplicateForm = asyncHandler(async (req, res) => {
  const source = await FormSchema.findOne({ formId: req.params.formId });
  if (!source || !canAccess(source, req.user)) return res.status(404).json({ success: false, message: 'Form not found' });
  const base = `${source.formId}-copy`;
  let formId = base;
  let number = 2;
  while (await FormSchema.exists({ formId })) formId = `${base}-${number++}`;
  const data = source.toObject();
  delete data._id;
  delete data.createdAt;
  delete data.updatedAt;
  const copy = await FormSchema.create({ ...data, formId, title: `${source.title} Copy`, version: 1, createdBy: req.userId });
  res.status(201).json({ success: true, data: normalize(copy) });
});

const deleteForm = asyncHandler(async (req, res) => {
  const form = await FormSchema.findOne({ formId: req.params.formId });
  if (!form || !canAccess(form, req.user)) return res.status(404).json({ success: false, message: 'Form not found' });
  if (!form.createdBy) return res.status(403).json({ success: false, message: 'Shared forms cannot be deleted' });
  await form.deleteOne();
  res.json({ success: true, message: 'Form deleted' });
});

module.exports = { list, getForm, createForm, updateForm, duplicateForm, deleteForm };
