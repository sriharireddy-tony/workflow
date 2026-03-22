const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  code: Joi.string().trim().min(1).max(64).required(),
  contactPerson: Joi.string().trim().max(120).allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().max(40).allow('', null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

const updateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  code: Joi.string().trim().min(1).max(64),
  contactPerson: Joi.string().trim().max(120).allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().max(40).allow('', null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
}).min(1);

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(500),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  search: Joi.string().trim().max(200).allow(''),
});

module.exports = { createSchema, updateSchema, listQuerySchema };
