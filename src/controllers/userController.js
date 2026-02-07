const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

class UserController {
  static getAll = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  });

  static getById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  });

  static getByEmail = asyncHandler(async (req, res) => {
    const user = await userService.getUserByEmail(req.params.email);
    res.json({ success: true, data: user });
  });

  static create = asyncHandler(async (req, res) => {
    const { email, password, userType } = req.body;
    const user = await userService.createUser({ email, password, userType });
    res.status(201).json({ success: true, data: user, message: 'User created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { email, password, userType } = req.body;
    const user = await userService.updateUser(req.params.id, { email, password, userType });
    res.json({ success: true, data: user, message: 'User updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  });

  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json({ success: true, data: result });
  });

  static changePassword = asyncHandler(async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    await userService.changePassword(email, currentPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  });
}

module.exports = UserController;
