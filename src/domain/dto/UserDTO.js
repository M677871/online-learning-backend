/**
 * Data Transfer Object for User representation.
 * Excludes sensitive information like passwords.
 */
class UserDTO {
    /**
     * @param {number|string} userId - The unique identifier of the user.
     * @param {string} email - The email address of the user.
     * @param {string} userType - The role or type of the user.
     * @param {Date|string} createdAt - The creation timestamp.
     */
    constructor(userId, email, userType, createdAt) {
        this.userId = userId;
        this.email = email;
        this.userType = userType;
        this.createdAt = createdAt;
    }

    /**
     * Factory method to create a UserDTO from a User domain entity.
     * @param {User} entity - The User domain entity instance.
     * @returns {UserDTO} The newly created DTO instance.
     */
    static fromEntity(entity) {
        return new UserDTO(
            entity.userId,
            entity.email,
            entity.userType,
            entity.createdAt
        );
    }
}

module.exports = UserDTO;
