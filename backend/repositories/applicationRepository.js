const Application = require('../models/Application');

const applicationRepository = {
  create(data) {
    return Application.create(data);
  },

  findById(applicationId) {
    return Application.findOne({ applicationId });
  },

  update(applicationId, data) {
    return Application.findOneAndUpdate({ applicationId }, data, {
      new: true,
      runValidators: true,
      context: 'query'
    });
  },

  delete(applicationId) {
    return Application.findOneAndDelete({ applicationId });
  }
};

module.exports = applicationRepository;