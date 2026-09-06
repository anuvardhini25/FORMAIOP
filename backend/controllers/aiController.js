const FormSchema = require('../models/FormSchema');
const { extractStructuredData } = require('../services/aiService');
const { validateAgainstSchema } = require('../utils/validateAgainstSchema');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/ai/extract
// Body: { formId, text }
const extractFromText = asyncHandler(async (req, res) => {
  const { formId, text } = req.body;

  if (!formId || !text || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'formId and text are required'
    });
  }

  const formSchema = await FormSchema.findOne({ formId });

  if (!formSchema) {
    return res.status(404).json({
      success: false,
      message: 'Form not found'
    });
  }

  let rawExtraction;

  try {
    rawExtraction = await extractStructuredData(formSchema, text);
  } catch (err) {
    // Print the actual AI error in the backend terminal
    console.error('AI EXTRACTION ERROR:', err);

    return res.status(502).json({
      success: false,
      message: 'Unable to extract information. Please fill the form manually.'
    });
  }

  const { safeData, rejected } =
    validateAgainstSchema(rawExtraction, formSchema);

  return res.json({
    success: true,
    data: safeData,
    rejectedFields: rejected
  });
});

module.exports = { extractFromText };
