const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    mimeType: { type: String, trim: true },
    size: { type: Number, min: 0 },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const StatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      required: true
    },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, trim: true }
  },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true, immutable: true },
    formId: { type: String, required: true, index: true, immutable: true },
    schemaVersion: { type: Number, required: true, min: 1, immutable: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'draft'
    },
    responses: { type: mongoose.Schema.Types.Mixed, default: {} },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    documents: { type: [DocumentSchema], default: [] },
    statusHistory: { type: [StatusHistorySchema], default: [] }
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model('Application', ApplicationSchema);