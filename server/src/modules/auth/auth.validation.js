const Joi = require('joi');

const registerSchema = Joi.object({
  tenantName: Joi.string().trim().min(2).max(120).required(),
  tenantCode: Joi.string().trim().uppercase().min(2).max(32).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  firstName: Joi.string().trim().min(1).max(80).required(),
  lastName: Joi.string().trim().min(1).max(80).required(),
});

const loginSchema = Joi.object({
  tenantCode: Joi.string().trim().uppercase().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
