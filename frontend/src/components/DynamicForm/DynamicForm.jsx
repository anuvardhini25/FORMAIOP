import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '../FormField/FormField';
import { useConditionalFields } from '../../hooks/useConditionalFields';

const DynamicForm = forwardRef(function DynamicForm({
  schema,
  onSubmit,
  onSaveDraft,
  initialValues = {},
  aiFields = [],
  onStepChange,
  activeStep: controlledStep,
  showReview = false,
  onValuesChange,
  saving = false
}, ref) {
  const sections = useMemo(
    () => schema.sections?.length ? schema.sections : [{ title: 'Form', description: '', fields: schema.fields || [] }],
    [schema]
  );
  const [internalStep, setInternalStep] = useState(0);
  const step = Math.min(Math.max(controlledStep ?? internalStep, 0), Math.max(sections.length - 1, 0));
  const setStep = (nextStep) => {
    const safeStep = Math.min(Math.max(nextStep, 0), Math.max(sections.length - 1, 0));
    setInternalStep(safeStep);
    onStepChange?.(safeStep);
  };
  const allFields = useMemo(() => sections.flatMap((section) => section.fields || []), [sections]);
  const { register, handleSubmit, watch, setValue, getValues, trigger, reset, formState: { errors } } = useForm({
    mode: 'onBlur',
    defaultValues: initialValues,
    shouldUnregister: true
  });

  useEffect(() => { reset(initialValues || {}); }, [initialValues, reset]);

  const values = watch();
  useEffect(() => { onValuesChange?.(values); }, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleAll = useConditionalFields(allFields, values);
  const visibleNames = new Set(visibleAll.map((field) => field.name));
  const hiddenNames = allFields.filter((field) => !visibleNames.has(field.name)).map((field) => field.name);
  useEffect(() => {
    hiddenNames.forEach((name) => setValue(name, undefined, { shouldDirty: true, shouldValidate: false }));
  }, [hiddenNames.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const sectionFields = sections[step]?.fields || [];
  const visible = useConditionalFields(sectionFields, values);

  useImperativeHandle(ref, () => ({
    setValue: (name, value, options) => setValue(name, value, { shouldValidate: true, shouldDirty: true, ...options }),
    getValues,
    trigger,
    reset
  }), [getValues, reset, setValue, trigger]);

  async function next() {
    const valid = await trigger(visible.map((field) => field.name));
    if (valid) setStep(step + 1);
  }

  async function finish() {
    await handleSubmit((data) => onSubmit?.(data, { currentStep: step }))();
  }

  if (showReview) return null;

  return (
    <div className="form-engine">
      {sections.length > 1 && <div className="stepper" aria-label="Form progress">
        {sections.map((section, index) => (
          <button key={`${section.title}-${index}`} type="button" className={index === step ? 'current' : index < step ? 'done' : ''} onClick={() => index <= step && setStep(index)} aria-current={index === step ? 'step' : undefined}>
            <span>{index < step ? '✓' : index + 1}</span><b>{section.title}</b>
          </button>
        ))}
      </div>}

      <form onSubmit={(event) => event.preventDefault()} noValidate>
        <section className="form-section">
          <div className="section-title">
            <div><span className="eyebrow">STEP {step + 1} OF {sections.length}</span><h2>{sections[step]?.title}</h2><p>{sections[step]?.description}</p></div>
            <span className="progress-percent">{Math.round(((step + 1) / sections.length) * 100)}%</span>
          </div>
          {visible.length ? visible.map((field) => <FormField key={field.id || field.name} field={field} register={register} errors={errors} aiField={aiFields.includes(field.name)} />) : <p className="muted">No additional information is required in this step.</p>}
          {Object.keys(errors).length > 0 && <div className="error-summary" role="alert">Please fix the highlighted fields before continuing.</div>}
          <div className="form-actions">
            {step > 0 && <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>← Back</button>}
            <div className="action-right">
              <button type="button" className="btn btn-secondary" onClick={() => onSaveDraft?.(getValues(), { currentStep: step })} disabled={saving}>{saving ? 'Saving…' : 'Save Draft'}</button>
              {step < sections.length - 1
                ? <button type="button" className="btn btn-primary" onClick={next}>Continue →</button>
                : <button type="button" className="btn btn-primary" onClick={finish}>Review & Submit →</button>}
            </div>
          </div>
        </section>
      </form>
    </div>
  );
});

export default DynamicForm;
