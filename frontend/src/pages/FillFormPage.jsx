import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import DynamicForm from '../components/DynamicForm/DynamicForm';
import MagicInput from '../components/MagicInput/MagicInput';
import { getForm } from '../services/formService';
import { createSubmission, getSubmission, updateSubmission, submitSubmission } from '../services/submissionService';
import { Card, Button, Loader, Badge, Toast } from '../components/UI';

export default function FillFormPage() {
  const { id, submissionId } = useParams();
  const nav = useNavigate();
  const formRef = useRef(null);
  const autoTimer = useRef(null);
  const saveInFlight = useRef(false);
  const [form, setForm] = useState(null);
  const [initial, setInitial] = useState({});
  const [aiFields, setAiFields] = useState([]);
  const [draftId, setDraftId] = useState(submissionId || null);
  const [review, setReview] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState('');
  const [toast, setToast] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loadedForm = await getForm(id);
        if (cancelled) return;
        setForm(loadedForm);
        if (submissionId) {
          const submission = await getSubmission(submissionId);
          if (cancelled) return;
          if (submission.formId !== id) throw new Error('This draft belongs to a different form.');
          setInitial(submission.values || {});
          setStep(submission.currentStep || 0);
          setAiFields(submission.aiAssistedFields || []);
        }
      } catch (error) {
        if (!cancelled) setErr(error.response?.data?.message || error.message || 'Unable to load form');
      }
    })();
    return () => { cancelled = true; clearTimeout(autoTimer.current); };
  }, [id, submissionId]);

  function scheduleAutoSave(values) {
    if (!form || review || submitting) return;
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => persist(values, { currentStep: step, silent: true }), 1200);
  }

  async function persist(values, meta = {}) {
    if (saveInFlight.current) return false;
    saveInFlight.current = true;
    setSaving(true);
    setErr('');
    try {
      const payload = { formId: id, values, aiAssistedFields: aiFields, currentStep: meta.currentStep ?? step };
      const result = draftId ? await updateSubmission(draftId, payload) : await createSubmission(payload);
      if (!draftId) setDraftId(result._id);
      setSaved('Saved just now');
      if (!meta.silent) {
        setToast('Draft saved');
        setTimeout(() => setToast(''), 2200);
      }
      return true;
    } catch (error) {
      setErr(error.response?.data?.message || 'Unable to save draft. Please retry.');
      return false;
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  function extracted(data) {
    const names = Object.keys(data);
    setAiFields((current) => [...new Set([...current, ...names])]);
    names.forEach((name) => formRef.current?.setValue(name, data[name]));
    setToast('AI information extracted — review the highlighted fields');
    setTimeout(() => setToast(''), 2800);
  }

  async function final(values) {
    clearTimeout(autoTimer.current);
    const savedOk = await persist(values, { currentStep: Math.max(0, (form.sections?.length || 1) - 1) });
    if (savedOk) setReview(values);
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setErr('');
    try {
      let idToSubmit = draftId;
      if (!idToSubmit) {
        const created = await createSubmission({ formId: id, values: review, aiAssistedFields: aiFields, currentStep: Math.max(0, (form.sections?.length || 1) - 1) });
        idToSubmit = created._id;
        setDraftId(idToSubmit);
      } else {
        await updateSubmission(idToSubmit, { values: review, aiAssistedFields: aiFields, currentStep: Math.max(0, (form.sections?.length || 1) - 1) });
      }
      const submitted = await submitSubmission(idToSubmit);
      nav(`/submissions/${submitted._id}?success=1`);
    } catch (error) {
      setErr(error.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (err && !form) return <AppShell><Card><div className="status error" role="alert">{err}</div></Card></AppShell>;
  if (!form) return <AppShell><Loader label="Loading form..." /></AppShell>;

  if (review) return (
    <AppShell>
      <div className="page-heading"><div><span className="eyebrow">FINAL REVIEW</span><h1>Review your information</h1><p>AI assists entry, but you stay in control. Check every answer before submitting.</p></div></div>
      <Card className="review-card">
        {form.sections?.map((section) => <div className="review-section" key={section.title}><h3>{section.title}</h3>{section.fields.map((field) => {
          const value = review[field.name];
          if (value === undefined || value === null || value === '') return null;
          return <div className="review-row" key={field.name}><span>{field.label}</span><b>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : Array.isArray(value) ? value.join(', ') : String(value)}</b>{aiFields.includes(field.name) && <Badge tone="ai">✦ AI Assisted</Badge>}</div>;
        })}</div>)}
        <div className="form-actions"><Button variant="secondary" onClick={() => setReview(null)} disabled={submitting}>← Edit</Button><Button onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit information →'}</Button></div>
      </Card>
      {err && <div className="status error" role="alert">{err}</div>}
    </AppShell>
  );

  return (
    <AppShell>
      <div className="page-heading"><div><span className="eyebrow">{draftId ? 'RESUME DRAFT' : 'ADAPTIVE WORKFLOW'}</span><h1>{form.title}</h1><p>{form.description}</p></div><div className="save-indicator" aria-live="polite">{saving ? 'Saving…' : saved || 'Ready to save'}</div></div>
      <MagicInput formId={id} onExtracted={extracted} />
      <Card className="ai-review-note"><span>✦</span><div><b>AI Extraction Review</b><p>Highlighted fields were populated from your description. Edit anything before continuing.</p></div>{aiFields.length > 0 && <><Badge tone="ai">{aiFields.length} AI extracted</Badge><div className="ai-review-actions"><button type="button" onClick={() => setToast('AI values accepted — review the form before submitting')}>Accept All</button><button type="button" onClick={() => document.querySelector('.form-engine')?.scrollIntoView({ behavior: 'smooth' })}>Review Manually</button><button type="button" onClick={() => { aiFields.forEach((name) => formRef.current?.setValue(name, form.fields?.find((field) => field.name === name)?.type === 'checkbox' ? false : '')); setAiFields([]); setToast('AI values cleared'); }}>Clear AI Values</button></div></>}</Card>
      <DynamicForm ref={formRef} schema={form} initialValues={initial} aiFields={aiFields} onValuesChange={scheduleAutoSave} activeStep={step} onStepChange={setStep} onSubmit={final} onSaveDraft={persist} saving={saving} />
      {err && <div className="status error" role="alert">{err}</div>}
      <Toast message={toast} onClose={() => setToast('')} />
    </AppShell>
  );
}
