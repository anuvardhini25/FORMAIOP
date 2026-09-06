/**
 * Validates AI-extracted JSON against a form's schema.
 *
 * - Removes any key not present in the schema's field list (the AI can never
 *   invent a field name that reaches the frontend).
 * - Drops values that don't match the field's expected type/allowed options.
 * - Skips null/undefined values entirely - that means "AI found nothing",
 *   so the field is simply left out and stays blank for manual entry.
 *
 * Returns { safeData, rejected } so callers can log/debug what was stripped
 * without ever sending it to the client.
 */
function validateAgainstSchema(aiOutput, formSchema) {
  const allowedFields = new Map(formSchema.fields.map((f) => [f.name, f]));
  const safeData = {};
  const rejected = [];

  for (const [key, value] of Object.entries(aiOutput || {})) {
    const field = allowedFields.get(key);

    if (!field) {
      rejected.push({ key, reason: 'field not in schema' });
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    if (!isValidForType(value, field)) {
      rejected.push({ key, reason: `invalid value for type "${field.type}"` });
      continue;
    }

    safeData[key] = value;
  }

  return { safeData, rejected };
}

function isValidForType(value, field) {
  switch (field.type) {
    case 'number':
      return typeof value === 'number' || (value !== '' && !isNaN(Number(value)));
    case 'checkbox':
      return typeof value === 'boolean';
    case 'select':
    case 'radio':
      return field.options && field.options.length ? field.options.includes(value) : typeof value === 'string';
    case 'text':
    case 'email':
    case 'date':
    case 'textarea':
    default:
      return typeof value === 'string';
  }
}

function validateResponses(responses, formSchema, requireRequired) {
  const { safeData, rejected } = validateAgainstSchema(responses, formSchema);
  if (rejected.length) {
    const error = new Error(`Invalid response fields: ${rejected.map((item) => item.key).join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const invalidRules = [];
  for (const field of formSchema.fields) {
    const value = safeData[field.name];
    if (value === undefined || value === null || value === '') continue;
    const rules = field.validation || {};
    if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) invalidRules.push(field.name);
    if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) invalidRules.push(field.name);
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) invalidRules.push(field.name);
    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) invalidRules.push(field.name);
    if (rules.pattern && typeof value === 'string' && !(new RegExp(rules.pattern)).test(value)) invalidRules.push(field.name);
    if (field.type === 'email' && typeof value === 'string' && !/^\S+@\S+\.\S+$/.test(value)) invalidRules.push(field.name);
  }
  if (invalidRules.length) {
    const error = new Error(`Responses failed validation: ${[...new Set(invalidRules)].join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (requireRequired) {
    const missing = formSchema.fields
      .filter((field) => field.required && isVisible(field, safeData) && (safeData[field.name] === undefined || safeData[field.name] === ''))
      .map((field) => field.name);
    if (missing.length) {
      const error = new Error(`Missing required responses: ${missing.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
  }

  return safeData;
}

function isVisible(field, responses) {
  if (!field.showIf) return true;
  const actual = responses[field.showIf.field];
  const expected = field.showIf.value;
  if (field.showIf.operator === 'equals') return actual === expected;
  if (field.showIf.operator === 'notEquals') return actual !== expected;
  return Array.isArray(actual) ? actual.includes(expected) : String(actual || '').includes(String(expected));
}

function calculateProgress(responses, formSchema) {
  const visibleFields = formSchema.fields.filter((field) => {
    if (!field.showIf) return true;
    const actual = responses[field.showIf.field];
    const expected = field.showIf.value;
    if (field.showIf.operator === 'equals') return actual === expected;
    if (field.showIf.operator === 'notEquals') return actual !== expected;
    return Array.isArray(actual) ? actual.includes(expected) : String(actual || '').includes(String(expected));
  });
  const completed = visibleFields.filter((field) => {
    const value = responses[field.name];
    return value !== undefined && value !== null && value !== '';
  }).length;
  return visibleFields.length ? Math.round((completed / visibleFields.length) * 100) : 0;
}

module.exports = { validateAgainstSchema, validateResponses, calculateProgress };
