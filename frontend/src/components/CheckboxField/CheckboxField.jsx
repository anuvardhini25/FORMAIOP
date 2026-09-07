import { buildValidationRules } from '../TextField/TextField';
export default function CheckboxField({ field, register, error, aiField }) {
  return <div className="form-field checkbox-field">
    <label className="checkbox-label" htmlFor={field.name}>
      <input id={field.name} type="checkbox" {...register(field.name, buildValidationRules(field))} aria-invalid={Boolean(error)} />
      <span>{field.label}{field.required && <span className="required-mark"> *</span>}</span>{aiField && <span className="ai-badge">✦ AI Extracted</span>}
    </label>
    {error && <span className="field-error">{error.message}</span>}
  </div>;
}
