const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const featureSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['BACKLOG', 'IN_PROGRESS', 'DONE', 'CANCELLED'], default: 'BACKLOG' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    startDate: { type: Date },
    endDate: { type: Date },
    assignments: [assignmentSchema],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

featureSchema.index({ tenantId: 1, projectId: 1, isDeleted: 1 });
featureSchema.index({ tenantId: 1, isDeleted: 1 });

module.exports = mongoose.model('Feature', featureSchema);
