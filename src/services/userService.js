const bcrypt = require('bcrypt');
const UserRepository = require('../domain/repositories/UserRepository');
const User = require('../domain/entities/User');
const { signAccessToken } = require('../config/jwt');
const ApiError = require('../middlewares/ApiError');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

class UserService {
    static async getAllUsers() {
        try {
            const users = await UserRepository.getAllUsers();
            return users;
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getUserById(id) {
        try {
            const user = await UserRepository.getUserById(id);
            if (!user) throw ApiError.notFound(`User ID ${id} not found`);
            return user;
        } catch (e) {
            throw e;
        }
    }

    static async getUserByEmail(email) {
        try {
            const row = await UserRepository.getUserByEmail(email);
            if (!row) throw ApiError.notFound(`User with email ${email} not found`);
            return User.fromRow(row);
        } catch (e) {
            throw e;
        }
    }

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
