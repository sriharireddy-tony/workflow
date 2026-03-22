const mongoose = require('mongoose');

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'];

const userSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, default: 'EMPLOYEE' },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    featureIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feature' }],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index(
  { tenantId: 1, email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
userSchema.index({ tenantId: 1, isDeleted: 1 });

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
