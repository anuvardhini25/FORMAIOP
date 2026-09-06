const { asyncHandler } = require('../middleware/errorHandler');
const applicationService = require('../services/applicationService');

const createApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.createApplication(req.body);
  res.status(201).json({ success: true, data: application });
});

const getApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplication(req.params.applicationId);
  res.json({ success: true, data: application });
});

const updateApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplication(req.params.applicationId, req.body);
  res.json({ success: true, data: application });
});

const deleteApplication = asyncHandler(async (req, res) => {
  await applicationService.deleteApplication(req.params.applicationId);
  res.json({ success: true, message: 'Application deleted' });
});

module.exports = { createApplication, getApplication, updateApplication, deleteApplication };