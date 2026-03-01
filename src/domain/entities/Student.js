class Student {
    constructor(studentId, userId, stuFName, stuLName, dob, profilePicture) {
        this.studentId = studentId;
        this.userId = userId;
        this.stuFName = stuFName;
        this.stuLName = stuLName;
        this.dob = dob;
        this.profilePicture = profilePicture;
    }

    static fromRow(row) {
        return new Student(
            row.studend_id,
            row.user_id,
            row.stu_FName,
            row.stu_LName,
            row.dob,
            row.profile_picture
        );
    }
}

module.exports = Student;
