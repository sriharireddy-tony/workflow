const Joi = require('joi');
const { ROLES } = require('../../models/User.model');

const createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(80).required(),
  lastName: Joi.string().trim().min(1).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string()
    .valid(...ROLES.filter((r) => r !== 'SUPER_ADMIN'))
    .default('EMPLOYEE'),
  managerId: Joi.string().hex().length(24).allow(null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(80),
  lastName: Joi.string().trim().min(1).max(80),
  role: Joi.string().valid(...ROLES),
  managerId: Joi.string().hex().length(24).allow(null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  password: Joi.string().min(8).max(128),
}).min(1);

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(500),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  role: Joi.string().valid(...ROLES),
  search: Joi.string().trim().max(200).allow(''),
});

const updateMeSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(80),
  lastName: Joi.string().trim().min(1).max(80),
  email: Joi.string().email().lowercase().trim(),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  listQuerySchema,
  updateMeSchema,
  changePasswordSchema,
};
