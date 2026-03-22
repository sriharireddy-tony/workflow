const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

tenantSchema.index({ code: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

module.exports = mongoose.model('Tenant', tenantSchema);
