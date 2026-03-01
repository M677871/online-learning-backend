class InstructorDTO {
    constructor(instructorId, userId, insFName, insLName, bio, profilePicture) {
        this.instructorId = instructorId;
        this.userId = userId;
        this.insFName = insFName;
        this.insLName = insLName;
        this.bio = bio;
        this.profilePicture = profilePicture;
    }

    static fromEntity(entity) {
        return new InstructorDTO(
            entity.instructorId,
            entity.userId,
            entity.insFName,
            entity.insLName,
            entity.bio,
            entity.profilePicture
        );
    }
}

module.exports = InstructorDTO;
