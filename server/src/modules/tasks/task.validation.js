const Joi = require('joi');

/** Employees create tasks under a feature; server resolves client & project. */
const employeeCreateSchema = Joi.object({
  featureId: Joi.string().hex().length(24).required(),
  title: Joi.string().trim().min(1).max(300).required(),
  description: Joi.string().allow('').max(10000),
  status: Joi.string()
    .valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED')
    .default('TODO'),
  startDate: Joi.date().required(),
  dueDate: Joi.date().required(),
});

const updateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300),
  description: Joi.string().allow('').max(10000),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
  startDate: Joi.date().allow(null),
  dueDate: Joi.date().allow(null),
}).min(1);

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(500),
  projectId: Joi.string().hex().length(24),
  featureId: Joi.string().hex().length(24),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'),
});

const commentSchema = Joi.object({
  message: Joi.string().trim().min(1).max(5000).required(),
});

module.exports = { employeeCreateSchema, updateSchema, listQuerySchema, commentSchema };
