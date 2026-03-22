const express = require('express');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdminPlus, requireRoles } = require('../../middleware/rbac.middleware');
const { createSchema, updateSchema, listQuerySchema } = require('./client.validation');
const clientController = require('./client.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', requireAdminPlus, validate(createSchema), clientController.create);
router.get('/', requireRoles('MANAGER', 'ADMIN', 'SUPER_ADMIN'), validate(listQuerySchema, 'query'), clientController.list);
router.get('/:id/projects', requireRoles('MANAGER', 'ADMIN', 'SUPER_ADMIN'), clientController.clientProjects);
router.get('/:id', requireRoles('MANAGER', 'ADMIN', 'SUPER_ADMIN'), clientController.getOne);
router.put('/:id', requireAdminPlus, validate(updateSchema), clientController.update);
router.delete('/:id', requireAdminPlus, clientController.remove);

module.exports = router;
