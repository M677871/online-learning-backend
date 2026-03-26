const bcrypt = require('bcrypt');
const UserRepository = require('../domain/repositories/UserRepository');
const User = require('../domain/entities/User');
const { signAccessToken } = require('../config/jwt');
const ApiError = require('../middlewares/ApiError');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

/**
 * Service class handling all user-related business logic.
 */
class UserService {
    /**
     * Retrieves all users from the data store.
     * @returns {Promise<User[]>} A promise that resolves to an array of User domain entities.
     * @throws {Error} If a database error occurs.
     */
    static async getAllUsers() {
        try {
            const users = await UserRepository.getAllUsers();
            return users;
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a specific user by their ID.
     * @param {number|string} id - The user ID.
     * @returns {Promise<User>} A promise that resolves to the User domain entity.
     * @throws {ApiError} If the user is not found.
     */
    static async getUserById(id) {
        try {
            const user = await UserRepository.getUserById(id);
            if (!user) throw ApiError.notFound(`User ID ${id} not found`);
            return user;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Retrieves a specific user by their email address.
     * @param {string} email - The user email.
     * @returns {Promise<User>} A promise that resolves to the User domain entity.
     * @throws {ApiError} If the user is not found.
     */
    static async getUserByEmail(email) {
        try {
            const row = await UserRepository.getUserByEmail(email);
            if (!row) throw ApiError.notFound(`User with email ${email} not found`);
            return User.fromRow(row);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new user with the given credentials and role.
     * @param {Object} params
     * @param {string} params.email - The email address for the new user.
     * @param {string} params.password - The plaintext password for the new user.
     * @param {string} params.userType - The role/type of the user.
     * @returns {Promise<User>} A promise that resolves to the created User domain entity.
     * @throws {ApiError} If the email already exists.
     */
    static async createUser({ email, password, userType }) {
        try {
            if (await UserRepository.emailExists(email)) {
                throw ApiError.conflict(`Email ${email} already exists`);
            }

            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
            const userId = await UserRepository.createUser({ email, passwordHash, userType });

            const user = await UserRepository.getUserById(userId);
            return user;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates an existing user's details. Only provided fields are updated.
     * @param {number|string} id - The ID of the user to update.
     * @param {Object} params - The fields to update.
     * @param {string} [params.email] - The new email address.
     * @param {string} [params.password] - The new plaintext password.
     * @param {string} [params.userType] - The new user role/type.
     * @returns {Promise<User>} A promise that resolves to the updated User domain entity.
     * @throws {ApiError} If the user doesn't exist, or if the email is already taken.
     */
    static async updateUser(id, { email, password, userType }) {
        try {
            const existing = await UserRepository.getUserById(id);
            if (!existing) throw ApiError.notFound(`User ID ${id} not found`);

            if (email && email !== existing.email) {
                if (await UserRepository.emailExists(email, id)) {
                    throw ApiError.conflict(`Email ${email} already exists`);
                }
            }

            const fields = {};
            if (email !== undefined) fields.email = email;
            if (userType !== undefined) fields.userType = userType;
            if (password) {
                fields.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
            }

            await UserRepository.updateUser(id, fields);

            const user = await UserRepository.getUserById(id);
            return user;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes a user.
     * @param {number|string} id - The ID of the user to delete.
     * @returns {Promise<void>}
     * @throws {ApiError} If the user does not exist.
     */
    static async deleteUser(id) {
        try {
            if (!(await UserRepository.userExistsById(id))) {
                throw ApiError.notFound(`User ID ${id} not found`);
            }
            await UserRepository.deleteUser(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Authenticates user login credentials.
     * @param {string} email - The user's email.
     * @param {string} password - The user's plaintext password.
     * @returns {Promise<{token: string, user: User}>} An object containing the generated JWT and authenticated user.
     * @throws {ApiError} If the email or password is invalid.
     */
    static async login(email, password) {
        try {
            const row = await UserRepository.getUserByEmail(email);
            if (!row) throw ApiError.unauthorized('Invalid email or password');

            const valid = await bcrypt.compare(password, row.password_hash);
            if (!valid) throw ApiError.unauthorized('Invalid email or password');

            const user = User.fromRow(row);

            const token = signAccessToken({
                id: user.userId,
                email: user.email,
                userType: user.userType,
            });

            return { token, user };
        } catch (e) {
            throw e;
        }
    }

    /**
     * Changes a user's password securely by verifying their current password.
     * @param {string} email - The user's email.
     * @param {string} currentPassword - The existing plaintext password.
     * @param {string} newPassword - The new plaintext password to set.
     * @returns {Promise<void>}
     * @throws {ApiError} If the user is not found or the current password is incorrect.
     */
    static async changePassword(email, currentPassword, newPassword) {
        try {
            const row = await UserRepository.getUserByEmail(email);
            if (!row) throw ApiError.notFound(`User with email ${email} not found`);

            const match = await bcrypt.compare(currentPassword, row.password_hash);
            if (!match) throw ApiError.unauthorized('Current password is incorrect');

            const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
            await UserRepository.updatePasswordHash(row.user_id, passwordHash);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = UserService;
