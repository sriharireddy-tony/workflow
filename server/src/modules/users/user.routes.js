const express = require('express');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdminPlus, requireRoles } = require('../../middleware/rbac.middleware');
const {
  createUserSchema,
  updateUserSchema,
  listQuerySchema,
  updateMeSchema,
  changePasswordSchema,
} = require('./user.validation');
const userController = require('./user.controller');

const router = express.Router();

router.use(authenticate);

router.patch('/me', validate(updateMeSchema), userController.updateMe);
router.post('/me/password', validate(changePasswordSchema), userController.changePassword);

router.post('/', requireAdminPlus, validate(createUserSchema), userController.create);
router.get('/', requireRoles('MANAGER', 'ADMIN', 'SUPER_ADMIN'), validate(listQuerySchema, 'query'), userController.list);
router.get('/:id/projects', userController.userProjects);
router.get('/:id/tasks', userController.userTasks);
router.get('/:id', userController.getOne);
router.put('/:id', requireAdminPlus, validate(updateUserSchema), userController.update);
router.delete('/:id', requireAdminPlus, userController.remove);

module.exports = router;
