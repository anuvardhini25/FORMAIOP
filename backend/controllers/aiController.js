const FormSchema = require('../models/FormSchema');
const { extractStructuredData } = require('../services/aiService');
const { validateAgainstSchema } = require('../utils/validateAgainstSchema');
const { asyncHandler } = require('../middleware/errorHandler');

const extractFromText = asyncHandler(async (req, res) => {
  const formId = String(req.body?.formId || '').trim();
  const text = String(req.body?.text || '').trim();
  if (!formId || !text) return res.status(400).json({ success: false, message: 'formId and text are required' });
  if (text.length > 10000) return res.status(400).json({ success: false, message: 'Description is too long' });

  const formSchema = await FormSchema.findOne({
    formId,
    $or: [{ createdBy: null }, { createdBy: req.userId }]
  });
  if (!formSchema) return res.status(404).json({ success: false, message: 'Form not found' });

  let rawExtraction;
  try {
    rawExtraction = await extractStructuredData(formSchema, text);
  } catch (error) {
    console.error('AI EXTRACTION ERROR:', error);
    return res.status(502).json({ success: false, message: 'AI extraction failed. Please try again or continue manually.' });
  }

  const { safeData, rejected } = validateAgainstSchema(rawExtraction, formSchema);
  res.json({ success: true, data: safeData, rejectedFields: rejected });
});

module.exports = { extractFromText };
