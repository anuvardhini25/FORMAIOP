const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

/**
 * Returns a configured chat model instance based on .env settings.
 * To add a new provider: add a case here (and install its LangChain package).
 * Nothing outside this function needs to know which provider is active -
 * that's the whole point of keeping the provider configurable via .env.
 */
function getChatModel() {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
  const apiKey = process.env.LLM_API_KEY;
  const modelName = process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('LLM_API_KEY is not set in .env');
  }

  switch (provider) {
    case 'openai':
      return new ChatOpenAI({
        apiKey,
        model: modelName,
        temperature: 0
      });
    // Add additional providers here, e.g.:
    // case 'anthropic': return new ChatAnthropic({ apiKey, model: modelName });
    default:
      throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
  }
}

/**
 * Builds a strict extraction prompt using ONLY the fields defined in the form
 * schema. The LLM is never told about, and can never return, any field
 * outside this list - that's what makes extraction "schema-aware".
 */
function buildExtractionPrompt(formSchema, userText) {
  const fieldDescriptions = formSchema.fields.map((f) => {
    const optionsNote = f.options && f.options.length ? ` (allowed values: ${f.options.join(', ')})` : '';
    return `- "${f.name}" (${f.type})${optionsNote}: ${f.label}`;
  });

  const systemPrompt = `You are a strict data extraction engine for a form called "${formSchema.title}".

You will be given a free-text description written by a user. Extract ONLY the following fields, using EXACTLY these field names as JSON keys:

${fieldDescriptions.join('\n')}

Rules:
1. Return ONLY valid JSON. No preamble, no explanation, no markdown code fences.
2. Use ONLY the field names listed above as keys. Never invent new keys.
3. Never invent or guess a value that is not clearly stated or strongly implied in the text.
4. If a field's value cannot be determined from the text, either omit the key or set it to null.
5. For fields with "allowed values", only use one of the listed allowed values, or null.
6. For "checkbox" type fields, return a boolean (true/false).
7. For "number" type fields, return a number, not a string.
8. Output a single flat JSON object and nothing else.`;

  return [new SystemMessage(systemPrompt), new HumanMessage(userText)];
}

/**
 * Runs extraction: user text + form schema -> raw JSON object (unvalidated).
 * Schema validation of the result happens separately, in utils/validateAgainstSchema.
 */
async function extractStructuredData(formSchema, userText) {
  const model = getChatModel();
  const messages = buildExtractionPrompt(formSchema, userText);

  const response = await model.invoke(messages);
  const rawText = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  return parseJsonSafely(rawText);
}

// LLMs sometimes wrap JSON in markdown fences despite instructions not to - strip those first.
function parseJsonSafely(text) {
  const cleaned=String(text||'').replace(/```(?:json)?/gi,'').replace(/```/g,'').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match=cleaned.match(/\{[\s\S]*\}/);
  if(match){ try { return JSON.parse(match[0]); } catch {} }
  throw new Error('LLM did not return valid JSON');
}

module.exports = { extractStructuredData };
