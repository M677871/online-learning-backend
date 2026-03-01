class Instructor {
    constructor(instructorId, userId, insFName, insLName, bio, profilePicture) {
        this.instructorId = instructorId;
        this.userId = userId;
        this.insFName = insFName;
        this.insLName = insLName;
        this.bio = bio;
        this.profilePicture = profilePicture;
    }

    static fromRow(row) {
        return new Instructor(
            row.instructor_id,
            row.user_id,
            row.ins_FName,
            row.ins_LName,
            row.bio,
            row.profile_picture
        );
    }
}

module.exports = Instructor;
