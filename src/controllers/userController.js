const UserService = require('../services/UserService');
const UserDTO = require('../domain/dto/UserDTO');

class UserController {
    static async getAll(req, res) {
        try {
            const users = await UserService.getAllUsers();
            const result = users.map(u => UserDTO.fromEntity(u));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in UserController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    static async getById(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            res.status(200).json({ success: true, data: UserDTO.fromEntity(user) });
        } catch (e) {
            console.error('Error in UserController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async getByEmail(req, res) {
        try {
            const user = await UserService.getUserByEmail(req.params.email);
            res.status(200).json({ success: true, data: UserDTO.fromEntity(user) });
        } catch (e) {
            console.error('Error in UserController.getByEmail', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async create(req, res) {
        try {
            const { email, password, userType } = req.body;
            const user = await UserService.createUser({ email, password, userType });
            res.status(201).json({ success: true, data: UserDTO.fromEntity(user), message: 'User created successfully' });
        } catch (e) {
            console.error('Error in UserController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async update(req, res) {
        try {
            const { email, password, userType } = req.body;
            const user = await UserService.updateUser(req.params.id, { email, password, userType });
            res.status(200).json({ success: true, data: UserDTO.fromEntity(user), message: 'User updated successfully' });
        } catch (e) {
            console.error('Error in UserController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async remove(req, res) {
        try {
            await UserService.deleteUser(req.params.id);
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (e) {
            console.error('Error in UserController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const { token, user } = await UserService.login(email, password);
            res.status(200).json({ success: true, data: { token, user: UserDTO.fromEntity(user) } });
        } catch (e) {
            console.error('Error in UserController.login', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async changePassword(req, res) {
        try {
            const { email, currentPassword, newPassword } = req.body;
            await UserService.changePassword(email, currentPassword, newPassword);
            res.status(200).json({ success: true, message: 'Password changed successfully' });
        } catch (e) {
            console.error('Error in UserController.changePassword', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = UserController;
