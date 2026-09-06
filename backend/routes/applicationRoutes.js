const express = require('express');
const {
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication
} = require('../controllers/applicationController');
const { validateApplicationRequest } = require('../middleware/validateApplication');

const router = express.Router();

router.post('/', validateApplicationRequest, createApplication);
router.get('/:applicationId', getApplication);
router.put('/:applicationId', validateApplicationRequest, updateApplication);
router.delete('/:applicationId', deleteApplication);

module.exports = router;