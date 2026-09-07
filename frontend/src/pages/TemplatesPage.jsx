import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import { Card, Button } from '../components/UI';
import { createForm, getForm } from '../services/formService';

const templates = [
  {
    formId: 'insurance-claim', title: 'Insurance Claim', description: 'Adaptive vehicle incident and damage claim.', badge: '18 fields', icon: '✦',
    schema: null
  },
  {
    formId: 'employee-leave-request', title: 'Employee Leave Request', description: 'A concise, schema-driven leave request with exact AI option values.', badge: '6 fields', icon: '◷',
    schema: {
      fields: [
        { id: 'employeeName', name: 'employeeName', label: 'Employee Name', type: 'text', required: true, validation: { required: true } },
        { id: 'employeeEmail', name: 'employeeEmail', label: 'Employee Email', type: 'email', required: true, validation: { required: true } },
        { id: 'leaveType', name: 'leaveType', label: 'Leave Type', type: 'select', required: true, options: ['casual', 'sick', 'earned', 'maternity', 'other'], validation: { required: true } },
        { id: 'startDate', name: 'startDate', label: 'Leave Start Date', type: 'date', required: true, validation: { required: true } },
        { id: 'endDate', name: 'endDate', label: 'Leave End Date', type: 'date', required: true, validation: { required: true } },
        { id: 'reason', name: 'reason', label: 'Reason for Leave', type: 'textarea', required: true, validation: { required: true } },
        { id: 'emergencyContact', name: 'emergencyContact', label: 'Emergency Contact', type: 'text', required: false }
      ]
    }
  },
  {
    formId: 'healthcare-intake', title: 'Healthcare Intake', description: 'A clean intake workflow with conditional insurance details.', badge: '7 fields', icon: '+',
    schema: {
      fields: [
        { id: 'patientName', name: 'patientName', label: 'Patient Name', type: 'text', required: true },
        { id: 'patientEmail', name: 'patientEmail', label: 'Email', type: 'email', required: true },
        { id: 'visitDate', name: 'visitDate', label: 'Visit Date', type: 'date', required: true },
        { id: 'reason', name: 'reason', label: 'Reason for Visit', type: 'textarea', required: true },
        { id: 'hasInsurance', name: 'hasInsurance', label: 'Do you have insurance?', type: 'select', required: true, options: ['yes', 'no'] },
        { id: 'insuranceProvider', name: 'insuranceProvider', label: 'Insurance Provider', type: 'text', showIf: { field: 'hasInsurance', operator: 'equals', value: 'yes' } },
        { id: 'allergies', name: 'allergies', label: 'Allergies or important notes', type: 'textarea' }
      ]
    }
  },
  {
    formId: 'customer-onboarding', title: 'Customer Onboarding', description: 'Collect core customer information for a new account.', badge: '6 fields', icon: '◇',
    schema: {
      fields: [
        { id: 'fullName', name: 'fullName', label: 'Full Name', type: 'text', required: true },
        { id: 'email', name: 'email', label: 'Email', type: 'email', required: true },
        { id: 'company', name: 'company', label: 'Company', type: 'text', required: true },
        { id: 'customerType', name: 'customerType', label: 'Customer Type', type: 'radio', required: true, options: ['business', 'individual'] },
        { id: 'companySize', name: 'companySize', label: 'Company Size', type: 'select', options: ['1-10', '11-50', '51-200', '201+'], showIf: { field: 'customerType', operator: 'equals', value: 'business' } },
        { id: 'notes', name: 'notes', label: 'Additional Notes', type: 'textarea' }
      ]
    }
  },
  {
    formId: 'incident-report', title: 'Incident Report', description: 'Capture operational incidents with adaptive follow-up questions.', badge: '7 fields', icon: '!',
    schema: {
      fields: [
        { id: 'reportedBy', name: 'reportedBy', label: 'Reported By', type: 'text', required: true },
        { id: 'incidentDate', name: 'incidentDate', label: 'Incident Date', type: 'date', required: true },
        { id: 'severity', name: 'severity', label: 'Severity', type: 'radio', required: true, options: ['low', 'medium', 'high', 'critical'] },
        { id: 'location', name: 'location', label: 'Location', type: 'text', required: true },
        { id: 'peopleAffected', name: 'peopleAffected', label: 'Were people affected?', type: 'checkbox' },
        { id: 'impactDetails', name: 'impactDetails', label: 'Impact Details', type: 'textarea', showIf: { field: 'peopleAffected', operator: 'equals', value: true } },
        { id: 'description', name: 'description', label: 'Incident Description', type: 'textarea', required: true }
      ]
    }
  }
];
// function justforfun(){
//   return(
//     <div>
//       print("This is the template Page:")
      
//     </div>
//   )
// }
function withSections(template) {
  const fields = template.schema.fields.map((field, index) => ({ ...field, order: index }));
  return { ...template.schema, fields, sections: [{ title: 'Form', description: template.description, order: 1, fields }] };
}

export default function TemplatesPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  async function useTemplate(template) {
    setLoading(template.formId);
    setError('');
    try {
      let form;
      try {
        form = await getForm(template.formId);
      } catch (error) {
        if (error.response?.status !== 404 || !template.schema) throw error;
        form = await createForm({ formId: template.formId, title: template.title, description: template.description, status: 'published', ...withSections(template) });
      }
      nav(`/forms/${form.formId}/fill`);
    } catch (error) {
      if (error.response?.status === 409) {
        const form = await getForm(template.formId);
        nav(`/forms/${form.formId}/fill`);
      } else setError(error.response?.data?.message || 'Unable to open template');
    } finally {
      setLoading('');
    }
  }

  return (
    <AppShell>
      <div className="page-heading"><div><span className="eyebrow">START FASTER</span><h1>Templates</h1><p>Use a real schema as a starting point, then make it your own.</p></div></div>
      {error && <div className="status error" role="alert">{error}</div>}
      <div className="template-grid">
        {templates.map((template) => <Card key={template.formId}>
          <div className="template-icon">{template.icon}</div><span className="eyebrow">{template.badge}</span><h2>{template.title}</h2><p>{template.description}</p>
          <Button onClick={() => useTemplate(template)} disabled={Boolean(loading)}>{loading === template.formId ? 'Opening…' : 'Use Template →'}</Button>
        </Card>)}
      </div>
    </AppShell>
  );
}
