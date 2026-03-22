const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roleInProject: { type: String, trim: true, default: 'MEMBER' },
    allocationPercent: { type: Number, min: 0, max: 100, default: 100 },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'DONE'], default: 'PLANNING' },
    startDate: { type: Date },
    endDate: { type: Date },
    members: [memberSchema],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index(
  { tenantId: 1, key: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
projectSchema.index({ tenantId: 1, clientId: 1, isDeleted: 1 });
projectSchema.index({ tenantId: 1, isDeleted: 1 });
projectSchema.index({ 'members.userId': 1, tenantId: 1 });

module.exports = mongoose.model('Project', projectSchema);
