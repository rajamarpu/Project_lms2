const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  inviteUser,
  updateUser,
  deleteUser
} = require('../../controllers/users.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All user management routes are admin only

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/invite')
  .post(inviteUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
