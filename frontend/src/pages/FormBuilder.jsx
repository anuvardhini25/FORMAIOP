import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import { Card, Button } from '../components/UI';
import { createForm, getForm, updateForm } from '../services/formService';

const types = ['text', 'textarea', 'number', 'email', 'date', 'select', 'radio', 'checkbox'];
const operators = ['equals', 'notEquals', 'contains'];

const makeField = (type = 'text') => ({
  id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  name: '',
  label: type.replace(/^./, (c) => c.toUpperCase()),
  type,
  required: false,
  placeholder: '',
  helpText: '',
  options: ['select', 'radio'].includes(type) ? ['option_1'] : [],
  validation: {},
  showIf: undefined,
  order: 0
});

function normalizeSections(data) {
  if (Array.isArray(data.sections) && data.sections.length) {
    return data.sections.map((section, index) => ({
      title: section.title || `Section ${index + 1}`,
      description: section.description || '',
      order: index + 1,
      fields: (section.fields || []).map((field, fieldIndex) => ({ ...field, order: fieldIndex }))
    }));
  }
  return [{ title: 'Form', description: data.description || '', order: 1, fields: data.fields || [] }];
}

export default function FormBuilder() {
  const { id } = useParams();
  const edit = Boolean(id);
  const nav = useNavigate();
  const [form, setForm] = useState({ formId: '', title: '', description: '', status: 'draft' });
  const [sections, setSections] = useState([{ title: 'Form', description: '', order: 1, fields: [] }]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!edit) return;
    getForm(id)
      .then((data) => {
        setForm({ formId: data.formId, title: data.title, description: data.description || '', status: data.status || 'draft' });
        const nextSections = normalizeSections(data);
        setSections(nextSections);
        setSectionIndex(0);
        setSelected(null);
      })
      .catch((error) => setErr(error.response?.data?.message || 'Unable to load form'));
  }, [edit, id]);

  const currentFields = sections[sectionIndex]?.fields || [];
  const allFields = useMemo(() => sections.flatMap((section) => section.fields || []), [sections]);
  const selectedField = selected === null ? null : currentFields[selected];
  const otherFields = allFields.filter((field) => field.name && field.name !== selectedField?.name);

  function setSection(patch) {
    setSections((prev) => prev.map((section, index) => index === sectionIndex ? { ...section, ...patch } : section));
  }

  function addField(type) {
    const field = makeField(type);
    setSection({ fields: [...currentFields, field].map((item, index) => ({ ...item, order: index })) });
    setSelected(currentFields.length);
    setErr('');
  }

  function updateField(key, value) {
    if (selected === null) return;
    setSection({ fields: currentFields.map((field, index) => index === selected ? { ...field, [key]: value } : field) });
  }

  function updateValidation(key, value) {
    updateField('validation', { ...(selectedField?.validation || {}), [key]: value === '' ? undefined : value });
  }

  function moveField(direction) {
    if (selected === null) return;
    const target = selected + direction;
    if (target < 0 || target >= currentFields.length) return;
    const next = [...currentFields];
    [next[selected], next[target]] = [next[target], next[selected]];
    setSection({ fields: next.map((field, index) => ({ ...field, order: index })) });
    setSelected(target);
  }

  function removeField() {
    if (selected === null) return;
    const next = currentFields.filter((_, index) => index !== selected).map((field, index) => ({ ...field, order: index }));
    setSection({ fields: next });
    setSelected(null);
  }

  function addSection() {
    setSections((prev) => [...prev, { title: `Section ${prev.length + 1}`, description: '', order: prev.length + 1, fields: [] }]);
    setSectionIndex(sections.length);
    setSelected(null);
  }

  function validate() {
    const normalizedId = String(form.formId || '').trim().toLowerCase();
    if (!normalizedId || !form.title.trim()) return 'Add a form ID and title.';
    if (!allFields.length) return 'Add at least one field.';
    const names = allFields.map((field) => field.name.trim());
    if (names.some((name) => !name)) return 'Every field needs a field name.';
    if (new Set(names).size !== names.length) return 'Field names must be unique.';
    if (allFields.some((field) => !types.includes(field.type))) return 'One or more fields have an invalid type.';
    if (allFields.some((field) => ['select', 'radio'].includes(field.type) && (!field.options?.length || new Set(field.options).size !== field.options.length))) {
      return 'Select and radio fields need at least one unique option.';
    }
    return '';
  }

  async function save() {
    setErr('');
    const validationError = validate();
    if (validationError) return setErr(validationError);
    setSaving(true);
    try {
      const cleanSections = sections.map((section, index) => ({
        ...section,
        order: index + 1,
        fields: (section.fields || []).map((field, fieldIndex) => ({ ...field, order: fieldIndex }))
      }));
      const payload = {
        ...form,
        formId: form.formId.trim().toLowerCase(),
        title: form.title.trim(),
        sections: cleanSections,
        fields: cleanSections.flatMap((section) => section.fields)
      };
      const saved = edit ? await updateForm(id, payload) : await createForm(payload);
      nav(`/forms/${saved.formId}/preview`);
    } catch (error) {
      setErr(error.response?.data?.message || 'Unable to save form');
    } finally {
      setSaving(false);
    }
  }

  const conditionField = selectedField?.showIf?.field;
  const conditionSource = allFields.find((field) => field.name === conditionField);

  return (
    <AppShell>
      <div className="builder-head">
        <div><span className="eyebrow">SCHEMA BUILDER</span><h1>{edit ? 'Edit form' : 'Create a new form'}</h1><p>Design the schema once. Forma AI renders the experience dynamically.</p></div>
        <div className="builder-head-actions"><Button variant="secondary" onClick={() => nav('/forms')}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save form'}</Button></div>
      </div>
      {err && <div className="status error" role="alert">{err}</div>}

      <div className="builder">
        <Card className="palette">
          <span className="eyebrow">FIELD PALETTE</span>
          {types.map((type) => <button key={type} type="button" onClick={() => addField(type)}>＋ {type}</button>)}
          <button type="button" className="section-add" onClick={addSection}>＋ section</button>
        </Card>

        <Card className="builder-canvas">
          <div className="builder-meta">
            <input aria-label="Form ID" placeholder="Form ID (e.g. employee-leave)" value={form.formId} disabled={edit} onChange={(e) => setForm({ ...form, formId: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-') })} />
            <input aria-label="Form title" placeholder="Form title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea aria-label="Form description" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="section-tabs" role="tablist" aria-label="Form sections">
            {sections.map((section, index) => <button type="button" key={`${section.title}-${index}`} className={index === sectionIndex ? 'active' : ''} onClick={() => { setSectionIndex(index); setSelected(null); }}>{section.title || `Section ${index + 1}`}</button>)}
          </div>
          <div className="section-editor">
            <input value={sections[sectionIndex]?.title || ''} aria-label="Section title" onChange={(e) => setSection({ title: e.target.value })} />
            <input value={sections[sectionIndex]?.description || ''} aria-label="Section description" placeholder="Section description" onChange={(e) => setSection({ description: e.target.value })} />
          </div>
          {currentFields.map((field, index) => (
            <button type="button" className={`builder-field ${selected === index ? 'selected' : ''}`} key={field.id || field.name || index} onClick={() => setSelected(index)}>
              <span>{index + 1}</span><div><b>{field.label || 'Untitled field'}</b><small>{field.type} · {field.required ? 'required' : 'optional'}{field.showIf ? ' · conditional' : ''}</small></div><span>⋮</span>
            </button>
          ))}
          {!currentFields.length && <div className="builder-empty">Choose a field type from the palette to begin this section.</div>}
        </Card>

        <Card className="properties">
          <span className="eyebrow">FIELD PROPERTIES</span>
          {!selectedField ? <p className="muted">Select a field to edit its properties.</p> : <>
            <label>Label<input value={selectedField.label || ''} onChange={(e) => updateField('label', e.target.value)} /></label>
            <label>Field name<input value={selectedField.name || ''} onChange={(e) => updateField('name', e.target.value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''))} /></label>
            <label>Type<select value={selectedField.type} onChange={(e) => updateField('type', e.target.value)}>{types.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label>Placeholder<input value={selectedField.placeholder || ''} onChange={(e) => updateField('placeholder', e.target.value)} /></label>
            <label>Help text<input value={selectedField.helpText || ''} onChange={(e) => updateField('helpText', e.target.value)} /></label>
            {['select', 'radio'].includes(selectedField.type) && <label>Options<textarea value={(selectedField.options || []).join('\n')} onChange={(e) => updateField('options', e.target.value.split('\n').map((value) => value.trim()).filter(Boolean))} placeholder="One machine value per line" /><small>These exact values are returned by AI extraction.</small></label>}
            <div className="property-grid"><label>Min length<input type="number" min="0" value={selectedField.validation?.minLength ?? ''} onChange={(e) => updateValidation('minLength', e.target.value === '' ? '' : Number(e.target.value))} /></label><label>Max length<input type="number" min="0" value={selectedField.validation?.maxLength ?? ''} onChange={(e) => updateValidation('maxLength', e.target.value === '' ? '' : Number(e.target.value))} /></label><label>Min value<input type="number" value={selectedField.validation?.min ?? ''} onChange={(e) => updateValidation('min', e.target.value === '' ? '' : Number(e.target.value))} /></label><label>Max value<input type="number" value={selectedField.validation?.max ?? ''} onChange={(e) => updateValidation('max', e.target.value === '' ? '' : Number(e.target.value))} /></label></div>
            <label>Pattern<input value={selectedField.validation?.pattern || ''} onChange={(e) => updateValidation('pattern', e.target.value)} placeholder="Optional regular expression" /></label>
            <label className="check"><input type="checkbox" checked={Boolean(selectedField.required)} onChange={(e) => updateField('required', e.target.checked)} /> Required</label>

            <div className="property-divider"><b>Conditional visibility</b><small>Show this field only when another field matches a value.</small></div>
            <label>Depends on<select value={conditionField || ''} onChange={(e) => updateField('showIf', e.target.value ? { field: e.target.value, operator: selectedField.showIf?.operator || 'equals', value: selectedField.showIf?.value ?? '' } : undefined)}><option value="">Always visible</option>{otherFields.map((field) => <option key={field.name} value={field.name}>{field.label} ({field.name})</option>)}</select></label>
            {conditionField && <><label>Operator<select value={selectedField.showIf.operator} onChange={(e) => updateField('showIf', { ...selectedField.showIf, operator: e.target.value })}>{operators.map((operator) => <option key={operator}>{operator}</option>)}</select></label><label>Value{conditionSource?.type === 'checkbox' ? <select value={String(selectedField.showIf.value)} onChange={(e) => updateField('showIf', { ...selectedField.showIf, value: e.target.value === 'true' })}><option value="true">true</option><option value="false">false</option></select> : ['select', 'radio'].includes(conditionSource?.type) ? <select value={selectedField.showIf.value} onChange={(e) => updateField('showIf', { ...selectedField.showIf, value: e.target.value })}>{(conditionSource.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input value={selectedField.showIf.value ?? ''} onChange={(e) => updateField('showIf', { ...selectedField.showIf, value: e.target.value })} />}</label></>}

            <div className="property-actions"><Button variant="secondary" onClick={() => moveField(-1)} disabled={selected === 0}>↑ Move</Button><Button variant="secondary" onClick={() => moveField(1)} disabled={selected === currentFields.length - 1}>↓ Move</Button></div>
            <button type="button" className="danger-link" onClick={removeField}>Delete field</button>
          </>}
        </Card>
      </div>
    </AppShell>
  );
}
