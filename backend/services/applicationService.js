const crypto = require('node:crypto');
const FormSchema = require('../models/FormSchema');
const applicationRepository = require('../repositories/applicationRepository');
const { validateResponses, calculateProgress } = require('../utils/validateAgainstSchema');

const statuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];

function serviceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getForm(formId) {
  const form = await FormSchema.findOne({ formId });
  if (!form) {
    throw serviceError('Form not found', 404);
  }
  return form;
}

function applicationId() {
  return `app_${crypto.randomUUID()}`;
}

function validateStatus(status) {
  if (status && !statuses.includes(status)) {
    throw serviceError('Invalid application status', 400);
  }
}

async function createApplication(payload) {
  const form = await getForm(payload.formId);
  const responses = validateResponses(payload.responses || {}, form, false);
  const status = 'draft';
  const application = await applicationRepository.create({
    applicationId: applicationId(),
    formId: form.formId,
    schemaVersion: form.version,
    status,
    responses,
    progress: calculateProgress(responses, form),
    documents: payload.documents || [],
    statusHistory: [{ status }]
  });
  return application;
}

async function getApplication(id) {
  const application = await applicationRepository.findById(id);
  if (!application) {
    throw serviceError('Application not found', 404);
  }
  return application;
}

async function updateApplication(id, payload) {
  const existing = await getApplication(id);
  const form = await getForm(existing.formId);
  const status = payload.status || existing.status;
  validateStatus(status);
  const responses = payload.responses === undefined
    ? validateResponses(existing.responses, form, status === 'submitted')
    : validateResponses(payload.responses, form, status === 'submitted');

  const update = {
    responses,
    progress: calculateProgress(responses, form)
  };
  if (payload.documents !== undefined) {
    update.documents = payload.documents;
  }
  if (status !== existing.status) {
    update.status = status;
    update.statusHistory = [...existing.statusHistory, { status }];
  }

  return applicationRepository.update(id, update);
}

async function deleteApplication(id) {
  const application = await applicationRepository.delete(id);
  if (!application) {
    throw serviceError('Application not found', 404);
  }
  return application;
}

module.exports = { createApplication, getApplication, updateApplication, deleteApplication };