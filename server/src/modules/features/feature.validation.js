const Joi = require('joi');

const createSchema = Joi.object({
  projectId: Joi.string().hex().length(24).required(),
  name: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().allow('').max(5000),
  status: Joi.string().valid('BACKLOG', 'IN_PROGRESS', 'DONE', 'CANCELLED').default('BACKLOG'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').default('MEDIUM'),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
});

const updateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  description: Joi.string().allow('').max(5000),
  status: Joi.string().valid('BACKLOG', 'IN_PROGRESS', 'DONE', 'CANCELLED'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
}).min(1);

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(500),
  projectId: Joi.string().hex().length(24),
  status: Joi.string().valid('BACKLOG', 'IN_PROGRESS', 'DONE', 'CANCELLED'),
});

const assignSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

module.exports = { createSchema, updateSchema, listQuerySchema, assignSchema };
