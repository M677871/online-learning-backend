const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const { signAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

class UserService {
  static async getAllUsers() {
    return userRepository.getAllUsers();
  }

  static async getUserById(id) {
    const user = await userRepository.getUserById(id);
    if (!user) throw ApiError.notFound(`User ID ${id} not found`);
    // Strip password hash before returning
    const { password_hash, ...safe } = user;
    return safe;
  }

  static async getUserByEmail(email) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) throw ApiError.notFound(`User with email ${email} not found`);
    const { password_hash, ...safe } = user;
    return safe;
  }

  static async createUser({ email, password, userType }) {
    if (await userRepository.emailExists(email)) {
      throw ApiError.conflict(`Email ${email} already exists`);
    }
    const id = await userRepository.createUser({ email, password, userType });
    return { userId: id, email, userType };
  }

  static async updateUser(id, { email, password, userType }) {
    if (!(await userRepository.userExistsById(id))) {
      throw ApiError.notFound(`User ID ${id} not found`);
    }
    const existing = await userRepository.getUserById(id);
    if (existing.email !== email && (await userRepository.emailExists(email))) {
      throw ApiError.conflict(`Email ${email} already exists`);
    }
    await userRepository.updateUser(id, { email, password, userType });
    return { userId: id, email, userType };
  }

  static async deleteUser(id) {
    if (!(await userRepository.userExistsById(id))) {
      throw ApiError.notFound(`User ID ${id} not found`);
    }
    await userRepository.deleteUser(id);
  }

  static async login(email, password) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    const token = signAccessToken({
      id: user.user_id,
      email: user.email,
      userType: user.user_type,
    });

    return {
      token,
      user: {
        id: user.user_id,
        email: user.email,
        userType: user.user_type,
      },
    };
  }

  static async changePassword(email, currentPassword, newPassword) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) throw ApiError.notFound(`User with email ${email} not found`);

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) throw ApiError.unauthorized('Current password is incorrect');

    await userRepository.changePassword(email, newPassword);
  }
}

module.exports = UserService;
