const Joi = require('joi');

const createSchema = Joi.object({
  clientId: Joi.string().hex().length(24).required(),
  name: Joi.string().trim().min(1).max(200).required(),
  key: Joi.string().trim().min(1).max(32).required(),
  description: Joi.string().allow('').max(5000),
  status: Joi.string().valid('PLANNING', 'ACTIVE', 'ON_HOLD', 'DONE').default('PLANNING'),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
});

const updateSchema = Joi.object({
  clientId: Joi.string().hex().length(24),
  name: Joi.string().trim().min(1).max(200),
  key: Joi.string().trim().min(1).max(32),
  description: Joi.string().allow('').max(5000),
  status: Joi.string().valid('PLANNING', 'ACTIVE', 'ON_HOLD', 'DONE'),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
}).min(1);

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(500),
  clientId: Joi.string().hex().length(24),
  status: Joi.string().valid('PLANNING', 'ACTIVE', 'ON_HOLD', 'DONE'),
});

const addMembersSchema = Joi.object({
  members: Joi.array()
    .items(
      Joi.object({
        userId: Joi.string().hex().length(24).required(),
        roleInProject: Joi.string().trim().max(80).default('MEMBER'),
        allocationPercent: Joi.number().min(0).max(100).default(100),
      })
    )
    .min(1)
    .required(),
});

module.exports = { createSchema, updateSchema, listQuerySchema, addMembersSchema };
