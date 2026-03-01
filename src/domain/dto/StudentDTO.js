class StudentDTO {
    constructor(studentId, userId, stuFName, stuLName, dob, profilePicture) {
        this.studentId = studentId;
        this.userId = userId;
        this.stuFName = stuFName;
        this.stuLName = stuLName;
        this.dob = dob;
        this.profilePicture = profilePicture;
    }

    static fromEntity(entity) {
        return new StudentDTO(
            entity.studentId,
            entity.userId,
            entity.stuFName,
            entity.stuLName,
            entity.dob,
            entity.profilePicture
        );
    }
}

module.exports = StudentDTO;
