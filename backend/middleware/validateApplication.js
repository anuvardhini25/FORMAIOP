const allowedStatuses = new Set(['draft', 'submitted', 'under_review', 'approved', 'rejected']);

function validateApplicationRequest(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ success: false, message: 'Request body must be an object' });
  }

  const protectedFields = ['applicationId', 'schemaVersion', 'progress', 'statusHistory', 'createdAt', 'updatedAt'];
  if (req.method === 'PUT') {
    protectedFields.push('formId');
  }
  const attemptedProtectedField = protectedFields.find((field) => Object.prototype.hasOwnProperty.call(body, field));
  if (attemptedProtectedField) {
    return res.status(400).json({ success: false, message: `${attemptedProtectedField} is managed by the server` });
  }

  if (req.method === 'POST') {
    if (typeof body.formId !== 'string' || !body.formId.trim()) {
      return res.status(400).json({ success: false, message: 'formId is required' });
    }
    if (body.status !== undefined) {
      return res.status(400).json({ success: false, message: 'status is assigned when an application is created' });
    }
  }

  if (body.responses !== undefined && (typeof body.responses !== 'object' || Array.isArray(body.responses) || body.responses === null)) {
    return res.status(400).json({ success: false, message: 'responses must be an object' });
  }

  if (body.documents !== undefined) {
    if (!Array.isArray(body.documents)) {
      return res.status(400).json({ success: false, message: 'documents must be an array' });
    }
    for (const document of body.documents) {
      if (!document || typeof document !== 'object' || typeof document.name !== 'string' || typeof document.url !== 'string') {
        return res.status(400).json({ success: false, message: 'Each document requires name and url' });
      }
      if (document.size !== undefined && (!Number.isFinite(document.size) || document.size < 0)) {
        return res.status(400).json({ success: false, message: 'Document size must be a non-negative number' });
      }
    }
  }

  if (body.status !== undefined && !allowedStatuses.has(body.status)) {
    return res.status(400).json({ success: false, message: 'Invalid application status' });
  }

  next();
}

module.exports = { validateApplicationRequest };