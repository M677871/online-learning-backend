class UserDTO {
    constructor(userId, email, userType, createdAt) {
        this.userId = userId;
        this.email = email;
        this.userType = userType;
        this.createdAt = createdAt;
    }

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
