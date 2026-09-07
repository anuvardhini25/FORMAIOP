function getSchemaFields(formSchema) {
  const fields = Array.isArray(formSchema?.fields) ? formSchema.fields : [];
  if (fields.length) return fields;
  return (formSchema?.sections || []).flatMap((section) => section.fields || []);
}

function isVisible(field, responses) {
  if (!field.showIf) return true;
  const actual = responses?.[field.showIf.field];
  const expected = field.showIf.value;
  switch (field.showIf.operator) {
    case 'equals': return actual === expected;
    case 'notEquals': return actual !== expected;
    case 'contains':
      return Array.isArray(actual)
        ? actual.includes(expected)
        : typeof actual === 'string' && actual.includes(String(expected));
    default: return true;
  }
}

function isValidForType(value, field) {
  switch (field.type) {
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'checkbox':
      return typeof value === 'boolean';
    case 'select':
    case 'radio':
      return Array.isArray(field.options) && field.options.length
        ? typeof value === 'string' && field.options.includes(value)
        : typeof value === 'string';
    case 'text':
    case 'email':
    case 'date':
    case 'textarea':
      return typeof value === 'string';
    default:
      return false;
  }
}

function validateAgainstSchema(aiOutput, formSchema) {
  const fields = getSchemaFields(formSchema);
  const allowedFields = new Map(fields.map((field) => [field.name, field]));
  const safeData = {};
  const rejected = [];

  if (!aiOutput || typeof aiOutput !== 'object' || Array.isArray(aiOutput)) {
    return { safeData, rejected: [{ key: '*', reason: 'AI response must be an object' }] };
  }

  for (const [key, value] of Object.entries(aiOutput)) {
    const field = allowedFields.get(key);
    if (!field) {
      rejected.push({ key, reason: 'field not in schema' });
      continue;
    }
    if (value === null || value === undefined) continue;
    if (!isValidForType(value, field)) {
      rejected.push({ key, reason: `invalid value for type "${field.type}"` });
      continue;
    }
    safeData[key] = value;
  }

  return { safeData, rejected };
}

function validateResponses(responses, formSchema, requireRequired) {
  const fields = getSchemaFields(formSchema);
  const { safeData, rejected } = validateAgainstSchema(responses, formSchema);

  if (rejected.length) {
    const error = new Error(`Invalid response fields: ${rejected.map((item) => item.key).join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Hidden conditional fields are removed from the persisted payload.
  for (const field of fields) {
    if (!isVisible(field, safeData)) delete safeData[field.name];
  }

  const invalidRules = [];
  for (const field of fields) {
    if (!isVisible(field, safeData)) continue;
    const value = safeData[field.name];
    if (value === undefined || value === null || value === '') continue;
    const rules = field.validation || {};

    if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) invalidRules.push(field.name);
    if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) invalidRules.push(field.name);
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) invalidRules.push(field.name);
    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) invalidRules.push(field.name);
    if (rules.pattern && typeof value === 'string') {
      try {
        if (!new RegExp(rules.pattern).test(value)) invalidRules.push(field.name);
      } catch {
        invalidRules.push(field.name);
      }
    }
    if (field.type === 'email' && typeof value === 'string' && !/^\S+@\S+\.\S+$/.test(value)) invalidRules.push(field.name);
  }

  if (invalidRules.length) {
    const error = new Error(`Responses failed validation: ${[...new Set(invalidRules)].join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (requireRequired) {
    const missing = fields
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

function calculateProgress(responses, formSchema) {
  const fields = getSchemaFields(formSchema);
  const visibleFields = fields.filter((field) => isVisible(field, responses));
  const completed = visibleFields.filter((field) => {
    const value = responses?.[field.name];
    return value !== undefined && value !== null && value !== '';
  }).length;
  return visibleFields.length ? Math.round((completed / visibleFields.length) * 100) : 0;
}

module.exports = { validateAgainstSchema, validateResponses, calculateProgress, getSchemaFields, isVisible };
