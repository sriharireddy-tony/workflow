const express = require('express');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdminPlus, requireManagerPlus } = require('../../middleware/rbac.middleware');
const {
  createSchema,
  updateSchema,
  listQuerySchema,
  addMembersSchema,
} = require('./project.validation');
const projectController = require('./project.controller');
const featureController = require('../features/feature.controller');
const taskController = require('../tasks/task.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', requireManagerPlus, validate(createSchema), projectController.create);
router.get('/', validate(listQuerySchema, 'query'), projectController.list);
router.get('/:id/members', requireManagerPlus, projectController.listMembers);
router.post('/:id/members', requireManagerPlus, validate(addMembersSchema), projectController.addMembers);
router.get('/:id/features', featureController.byProject);
router.get('/:id/tasks', taskController.byProject);
router.get('/:id', projectController.getOne);
router.put('/:id', requireManagerPlus, validate(updateSchema), projectController.update);
router.delete('/:id', requireAdminPlus, projectController.remove);

module.exports = router;
