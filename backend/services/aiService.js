const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { ChatOpenAI } = require('@langchain/openai');

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

function getChatModel() {
  const provider = String(process.env.LLM_PROVIDER || 'google').trim().toLowerCase();
  const apiKey = String(process.env.LLM_API_KEY || '').trim();
  const modelName = String(process.env.LLM_MODEL || 'gemini-3.6-flash').trim();

  if (!apiKey) throw new Error('LLM_API_KEY is not configured');
  if (!modelName) throw new Error('LLM_MODEL is not configured');

  const configuration = provider === 'google' || provider === 'gemini'
    ? { baseURL: GEMINI_BASE_URL }
    : undefined;

  if (provider !== 'google' && provider !== 'gemini' && provider !== 'openai') {
    throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
  }

  return new ChatOpenAI({
    apiKey,
    model: modelName,
    temperature: 0,
    configuration
  });
}

function getFields(formSchema) {
  if (Array.isArray(formSchema.fields) && formSchema.fields.length) return formSchema.fields;
  return (formSchema.sections || []).flatMap((section) => section.fields || []);
}

function buildExtractionPrompt(formSchema, userText) {
  const fields = getFields(formSchema);
  const fieldDescriptions = fields.map((field) => {
    const options = Array.isArray(field.options) && field.options.length
      ? ` | allowed option values: ${JSON.stringify(field.options)}`
      : '';
    return `- ${JSON.stringify(field.name)} | type: ${field.type} | label: ${JSON.stringify(field.label)}${options}`;
  });

  const systemPrompt = `You are Forma AI's strict schema-aware extraction engine.

FORM: ${formSchema.title}

ONLY these fields may be returned:
${fieldDescriptions.join('\n')}

Rules:
1. Return one flat JSON object and nothing else. No markdown and no explanation.
2. JSON keys MUST exactly match the field names above. Never invent, rename, or add fields.
3. Extract only information stated or clearly supported by the user's text. Omit unknown values.
4. For select/radio fields, labels are human-readable only. ALWAYS return the exact machine option value from the allowed option list. Never capitalize, paraphrase, or invent an option.
5. Never return an option outside the allowed list.
6. Checkbox fields must be true or false.
7. Number fields must be JSON numbers, not numeric strings.
8. Date fields must use YYYY-MM-DD when a complete date is known.
9. Preserve the user's meaning for text and textarea fields without adding facts.`;

  return [new SystemMessage(systemPrompt), new HumanMessage(String(userText).trim())];
}

async function extractStructuredData(formSchema, userText) {
  const model = getChatModel();
  const response = await model.invoke(buildExtractionPrompt(formSchema, userText));
  const content = response?.content;
  const rawText = typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.map((part) => typeof part === 'string' ? part : part?.text || '').join('')
      : JSON.stringify(content ?? '');

  return parseJsonSafely(rawText);
}

function parseJsonSafely(text) {
  const cleaned = String(text || '')
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* fall through */ }
    }
  }

  throw new Error('LLM did not return valid JSON');
}

module.exports = { extractStructuredData };
