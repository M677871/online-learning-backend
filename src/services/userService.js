const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const { signAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const userMapper = require('../mappers/userMapper');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

class UserService {
  /**
   * @returns {object[]} Array of domain user objects
   */
  static async getAllUsers() {
    const rows = await userRepository.getAllUsers();
    return userMapper.toDomainList(rows);
  }

  /**
   * @param {number} id
   * @returns {object} Domain user object (with passwordHash for internal use)
   */
  static async getUserById(id) {
    const row = await userRepository.getUserById(id);
    if (!row) throw ApiError.notFound(`User ID ${id} not found`);
    return userMapper.toDomain(row);
  }

  /**
   * @param {string} email
   * @returns {object} Domain user object
   */
  static async getUserByEmail(email) {
    const row = await userRepository.getUserByEmail(email);
    if (!row) throw ApiError.notFound(`User with email ${email} not found`);
    return userMapper.toDomain(row);
  }

  /**
   * Register a new user. Handles hashing + uniqueness.
   * @param {{ email: string, password: string, userType: string }} data
   * @returns {object} Domain user object
   */
  static async createUser({ email, password, userType }) {
    if (await userRepository.emailExists(email)) {
      throw ApiError.conflict(`Email ${email} already exists`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = await userRepository.createUser({ email, passwordHash, userType });

    // Return the newly-created user as a domain object
    const row = await userRepository.getUserById(userId);
    return userMapper.toDomain(row);
  }

  /**
   * Update user. Only hashes password if a new one is provided.
   * @param {number} id
   * @param {{ email?: string, password?: string, userType?: string }} data
   * @returns {object} Updated domain user object
   */
  static async updateUser(id, { email, password, userType }) {
    const existing = await userRepository.getUserById(id);
    if (!existing) throw ApiError.notFound(`User ID ${id} not found`);

    // Check email uniqueness only if email is changing
    if (email && email !== existing.email) {
      if (await userRepository.emailExists(email, id)) {
        throw ApiError.conflict(`Email ${email} already exists`);
      }
    }

    // Build partial update — only hash password when provided
    const fields = {};
    if (email !== undefined) fields.email = email;
    if (userType !== undefined) fields.userType = userType;
    if (password) {
      fields.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    await userRepository.updateUser(id, fields);

    const row = await userRepository.getUserById(id);
    return userMapper.toDomain(row);
  }

  /**
   * @param {number} id
   */
  static async deleteUser(id) {
    if (!(await userRepository.userExistsById(id))) {
      throw ApiError.notFound(`User ID ${id} not found`);
    }
    await userRepository.deleteUser(id);
  }

  /**
   * Authenticate a user. Returns token + domain user.
   * @param {string} email
   * @param {string} password
   * @returns {{ token: string, user: object }}
   */
  static async login(email, password) {
    const row = await userRepository.getUserByEmail(email);
    if (!row) throw ApiError.unauthorized('Invalid email or password');

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    const user = userMapper.toDomain(row);

    const token = signAccessToken({
      id: user.userId,
      email: user.email,
      userType: user.userType,
    });

    return { token, user };
  }

  /**
   * Change password for authenticated user.
   * @param {string} email
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  static async changePassword(email, currentPassword, newPassword) {
    const row = await userRepository.getUserByEmail(email);
    if (!row) throw ApiError.notFound(`User with email ${email} not found`);

    const match = await bcrypt.compare(currentPassword, row.password_hash);
    if (!match) throw ApiError.unauthorized('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePasswordHash(row.user_id, passwordHash);
  }
}

module.exports = UserService;
