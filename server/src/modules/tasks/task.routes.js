const express = require('express');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { employeeCreateSchema, updateSchema, listQuerySchema, commentSchema } = require('./task.validation');
const taskController = require('./task.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', requireRoles('EMPLOYEE'), validate(employeeCreateSchema), taskController.create);
router.get('/', validate(listQuerySchema, 'query'), taskController.list);
router.post('/:id/comments', validate(commentSchema), taskController.addComment);
router.get('/:id', taskController.getOne);
router.put('/:id', taskController.update);
router.delete('/:id', requireRoles('SUPER_ADMIN'), taskController.remove);

module.exports = router;
