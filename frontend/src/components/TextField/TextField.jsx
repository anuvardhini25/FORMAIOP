export default function TextField({ field, register, error, type = 'text', aiField }) {
  const inputType = type === 'number' ? 'number' : type;
  return <div className="form-field">
    <label htmlFor={field.name}>{field.label}{field.required && <span className="required-mark"> *</span>}{aiField && <span className="ai-badge">✦ AI Extracted</span>}</label>
    <input id={field.name} type={inputType} placeholder={field.placeholder} step={type === 'number' ? 'any' : undefined} {...register(field.name, buildValidationRules(field))} className={error ? 'input-error' : ''} aria-invalid={Boolean(error)} aria-describedby={error ? `${field.name}-error` : undefined} />
    {field.helpText && <small>{field.helpText}</small>}
    {error && <span id={`${field.name}-error`} className="field-error">{error.message}</span>}
  </div>;
}

export function buildValidationRules(field) {
  const validation = field.validation || {};
  const rules = {};
  if (field.required || validation.required) rules.required = 'This field is required';
  if (validation.minLength !== undefined) rules.minLength = { value: Number(validation.minLength), message: `Minimum length is ${validation.minLength}` };
  if (validation.maxLength !== undefined) rules.maxLength = { value: Number(validation.maxLength), message: `Maximum length is ${validation.maxLength}` };
  if (validation.min !== undefined) rules.min = { value: Number(validation.min), message: `Minimum value is ${validation.min}` };
  if (validation.max !== undefined) rules.max = { value: Number(validation.max), message: `Maximum value is ${validation.max}` };
  if (validation.pattern) rules.pattern = { value: new RegExp(validation.pattern), message: 'Invalid format' };
  if (field.type === 'email') rules.pattern = { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' };
  if (field.type === 'number') rules.valueAsNumber = true;
  return rules;
}
