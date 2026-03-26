const UserService = require('../services/UserService');
const UserDTO = require('../domain/dto/UserDTO');

/**
 * Controller class to handle user-related HTTP requests.
 */
class UserController {
    /**
     * Retrieves all users.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the users array.
     */
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

    /**
     * Retrieves a user by their unique ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the user data.
     */
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

    /**
     * Retrieves a user by their email address.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the user data.
     */
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

    /**
     * Creates a new user.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response with the created user data.
     */
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

    /**
     * Updates an existing user's information.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response with the updated user data.
     */
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

    /**
     * Deletes a user by their ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response confirming deletion.
     */
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

    /**
     * Authenticates a user and generates a login token.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the auth token and user data.
     */
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

    /**
     * Changes a user's password.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response confirming password change.
     */
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
