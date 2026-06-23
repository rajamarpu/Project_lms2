const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../../controllers/users.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { updateUserSchema, getUsersSchema } = require('../../validations/user.validation');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All user management routes are admin only

router.route('/')
  .get(validate(getUsersSchema), getUsers);

router.route('/:id')
  .get(getUser)
  .put(validate(updateUserSchema), updateUser)
  .delete(deleteUser);

module.exports = router;
