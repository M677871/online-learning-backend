const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticate = require('../middleware/auth/authenticate');
const authorize = require('../middleware/auth/authorize');
const { validateUser, validateUserId, validateUserEmail, validateUserLogin, validateUserChangePassword } = require('../validators/user.dto');

// Public routes
router.post('/login', validateUserLogin, UserController.login);
router.post('/', validateUser, UserController.create);                         // register

// Protected routes
router.get('/', authenticate, authorize(['instructor']), UserController.getAll);
router.get('/:id', authenticate, validateUserId, UserController.getById);
router.get('/email/:email', authenticate, validateUserEmail, UserController.getByEmail);
router.put('/changePassword', authenticate, validateUserChangePassword, UserController.changePassword);
router.put('/:id', authenticate, authorize(['instructor']), validateUserId, validateUser, UserController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateUserId, UserController.remove);

module.exports = router;
