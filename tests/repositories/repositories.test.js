jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
}));

const pool = require('../../src/config/db');

const CategoryRepository = require('../../src/domain/repositories/CategoryRepository');
const CourseRepository = require('../../src/domain/repositories/CourseRepository');
const CourseMaterialRepository = require('../../src/domain/repositories/CourseMaterialRepository');
const EnrollmentRepository = require('../../src/domain/repositories/EnrollmentRepository');
const InstructorRepository = require('../../src/domain/repositories/InstructorRepository');
const QuizAnswerRepository = require('../../src/domain/repositories/QuizAnswerRepository');
const QuizQuestionRepository = require('../../src/domain/repositories/QuizQuestionRepository');
const QuizRepository = require('../../src/domain/repositories/QuizRepository');
const QuizResultRepository = require('../../src/domain/repositories/QuizResultRepository');
const StudentRepository = require('../../src/domain/repositories/StudentRepository');
const UserRepository = require('../../src/domain/repositories/UserRepository');

const createConnection = () => ({
    query: jest.fn(),
    release: jest.fn(),
});

const mockConnection = () => {
    const conn = createConnection();
    pool.getConnection.mockResolvedValue(conn);
    return conn;
};

describe('Repository layer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('CategoryRepository', () => {
        it('should run category repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '5' })
                .mockResolvedValueOnce([{ category_id: 5, category_name: 'Programming', description: 'Courses' }])
                .mockResolvedValueOnce([{ category_id: 1, category_name: 'Programming', description: 'Courses' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{ course_id: 10 }])
                .mockResolvedValueOnce([{ instructor_id: 2 }]);

            await expect(CategoryRepository.createCategory({ categoryName: 'Programming', description: 'Courses' })).resolves.toBe(5);
            await expect(CategoryRepository.getCategoryById(5)).resolves.toMatchObject({ categoryId: 5, categoryName: 'Programming' });
            await expect(CategoryRepository.getAllCategories()).resolves.toHaveLength(1);
            await expect(CategoryRepository.updateCategory(5, { categoryName: 'Programming', description: 'Courses' })).resolves.toBe(1);
            await expect(CategoryRepository.deleteCategory(5)).resolves.toBe(1);
            await expect(CategoryRepository.categoryExists(5)).resolves.toBe(true);
            await expect(CategoryRepository.getCategoryCourses(5)).resolves.toEqual([{ course_id: 10 }]);
            await expect(CategoryRepository.getCategoryInstructors(5)).resolves.toEqual([{ instructor_id: 2 }]);

            expect(conn.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO categories'), ['Programming', 'Courses']);
            expect(conn.release).toHaveBeenCalledTimes(8);
        });

        it('should return null/false for missing category records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(CategoryRepository.getCategoryById(99)).resolves.toBeNull();
            await expect(CategoryRepository.categoryExists(99)).resolves.toBe(false);
        });
    });

    describe('CourseRepository', () => {
        it('should run course repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '11' })
                .mockResolvedValueOnce([{ course_id: 11, instructor_id: 2, categorie_id: 1, course_name: 'Node', description: 'Basics', create_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ course_id: 1, instructor_id: 2, categorie_id: 1, course_name: 'Node', description: 'Basics', create_at: '2025-01-01' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{ instructor_id: 2 }])
                .mockResolvedValueOnce([{ studend_id: 5 }])
                .mockResolvedValueOnce([{ course_id: 1, instructor_id: 2, categorie_id: 1, course_name: 'Node', description: 'Basics', create_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ course_id: 1, course_name: 'Node' }]);

            await expect(CourseRepository.createCourse({ instructorId: 2, categorieId: 1, courseName: 'Node', description: 'Basics' })).resolves.toBe(11);
            await expect(CourseRepository.getCourseById(11)).resolves.toMatchObject({ courseId: 11, courseName: 'Node' });
            await expect(CourseRepository.getAllCourses()).resolves.toHaveLength(1);
            await expect(CourseRepository.updateCourse(11, { instructorId: 2, categorieId: 1, courseName: 'Node', description: 'Basics' })).resolves.toBe(1);
            await expect(CourseRepository.deleteCourse(11)).resolves.toBe(1);
            await expect(CourseRepository.courseExistsById(11)).resolves.toBe(true);
            await expect(CourseRepository.getInstructorByCourseId(11)).resolves.toEqual({ instructor_id: 2 });
            await expect(CourseRepository.getStudentsOfCourse(11)).resolves.toEqual([{ studend_id: 5 }]);
            await expect(CourseRepository.getCoursesByInstructorId(2)).resolves.toHaveLength(1);
            await expect(CourseRepository.getStudentEnrolledCourses(5)).resolves.toEqual([{ course_id: 1, course_name: 'Node' }]);

            expect(conn.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO courses'), [2, 1, 'Node', 'Basics']);
            expect(conn.release).toHaveBeenCalledTimes(10);
        });

        it('should return null/false for missing course records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(CourseRepository.getCourseById(99)).resolves.toBeNull();
            await expect(CourseRepository.courseExistsById(99)).resolves.toBe(false);
            await expect(CourseRepository.getInstructorByCourseId(99)).resolves.toBeNull();
        });
    });

    describe('CourseMaterialRepository', () => {
        it('should run course material repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '4' })
                .mockResolvedValueOnce([{ material_id: 4, course_id: 1, title: 'Slides', material_type: 'pdf', file_path: 'https://example.com/slides.pdf', created_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ material_id: 1, course_id: 1, title: 'Slides', material_type: 'pdf', file_path: 'https://example.com/slides.pdf', created_at: '2025-01-01' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{ material_id: 1, course_id: 1, title: 'Slides', material_type: 'pdf', file_path: 'https://example.com/slides.pdf', created_at: '2025-01-01' }]);

            await expect(CourseMaterialRepository.createCourseMaterial({ courseId: 1, title: 'Slides', materialType: 'pdf', filePath: 'https://example.com/slides.pdf' })).resolves.toBe(4);
            await expect(CourseMaterialRepository.getCourseMaterialById(4)).resolves.toMatchObject({ materialId: 4, title: 'Slides' });
            await expect(CourseMaterialRepository.getAllCourseMaterials()).resolves.toHaveLength(1);
            await expect(CourseMaterialRepository.updateCourseMaterial(4, { courseId: 1, title: 'Slides', materialType: 'pdf', filePath: 'https://example.com/slides.pdf' })).resolves.toBe(1);
            await expect(CourseMaterialRepository.deleteCourseMaterial(4)).resolves.toBe(1);
            await expect(CourseMaterialRepository.materialExists(4)).resolves.toBe(true);
            await expect(CourseMaterialRepository.getMaterialsByCourseId(1)).resolves.toHaveLength(1);

            expect(conn.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO course_materials'), [1, 'Slides', 'pdf', 'https://example.com/slides.pdf']);
            expect(conn.release).toHaveBeenCalledTimes(7);
        });

        it('should return null/false for missing material records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(CourseMaterialRepository.getCourseMaterialById(88)).resolves.toBeNull();
            await expect(CourseMaterialRepository.materialExists(88)).resolves.toBe(false);
        });
    });

    describe('EnrollmentRepository', () => {
        it('should run enrollment repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '7' })
                .mockResolvedValueOnce([{ enrollment_id: 7, student_id: 1, course_id: 2, status: 'enrolled', enrolled_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ enrollment_id: 1, student_id: 1, course_id: 2, status: 'enrolled', enrolled_at: '2025-01-01' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{}]);

            await expect(EnrollmentRepository.createEnrollment({ studentId: 1, courseId: 2, status: 'enrolled' })).resolves.toBe(7);
            await expect(EnrollmentRepository.getEnrollmentById(7)).resolves.toMatchObject({ enrollmentId: 7, studentId: 1 });
            await expect(EnrollmentRepository.getAllEnrollments()).resolves.toHaveLength(1);
            await expect(EnrollmentRepository.updateEnrollment(7, { studentId: 1, courseId: 2, status: 'completed' })).resolves.toBe(1);
            await expect(EnrollmentRepository.deleteEnrollment(7)).resolves.toBe(1);
            await expect(EnrollmentRepository.enrollmentExists(7)).resolves.toBe(true);
            await expect(EnrollmentRepository.enrollmentExistsByStudentAndCourse(1, 2)).resolves.toBe(true);

            expect(conn.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO enrollments'), [1, 2, 'enrolled']);
            expect(conn.release).toHaveBeenCalledTimes(7);
        });

        it('should return null/false for missing enrollment records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(EnrollmentRepository.getEnrollmentById(99)).resolves.toBeNull();
            await expect(EnrollmentRepository.enrollmentExists(99)).resolves.toBe(false);
            await expect(EnrollmentRepository.enrollmentExistsByStudentAndCourse(2, 3)).resolves.toBe(false);
        });
    });

    describe('InstructorRepository', () => {
        it('should run instructor repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '6' })
                .mockResolvedValueOnce([{ instructor_id: 6, user_id: 3, ins_FName: 'John', ins_LName: 'Doe', bio: 'Bio', profile_picture: 'https://example.com/p.png' }])
                .mockResolvedValueOnce([{ instructor_id: 1, user_id: 3, ins_FName: 'John', ins_LName: 'Doe', bio: 'Bio', profile_picture: 'https://example.com/p.png' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{ instructor_id: 6, user_id: 3, ins_FName: 'John', ins_LName: 'Doe', bio: 'Bio', profile_picture: 'https://example.com/p.png' }])
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{ course_id: 1 }]);

            await expect(InstructorRepository.createInstructor({ userId: 3, insFName: 'John', insLName: 'Doe', bio: 'Bio', profilePicture: 'https://example.com/p.png' })).resolves.toBe(6);
            await expect(InstructorRepository.getInstructorById(6)).resolves.toMatchObject({ instructorId: 6, userId: 3 });
            await expect(InstructorRepository.getAllInstructors()).resolves.toHaveLength(1);
            await expect(InstructorRepository.updateInstructor(6, { userId: 3, insFName: 'John', insLName: 'Doe', bio: 'Bio', profilePicture: 'https://example.com/p.png' })).resolves.toBe(1);
            await expect(InstructorRepository.deleteInstructor(6)).resolves.toBe(1);
            await expect(InstructorRepository.instructorExists(6)).resolves.toBe(true);
            await expect(InstructorRepository.getInstructorByUserId(3)).resolves.toMatchObject({ instructorId: 6, userId: 3 });
            await expect(InstructorRepository.instructorExistsByUserId(3)).resolves.toBe(true);
            await expect(InstructorRepository.getInstructorCourses(6)).resolves.toEqual([{ course_id: 1 }]);

            expect(conn.release).toHaveBeenCalledTimes(9);
        });

        it('should return null/false for missing instructor records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(InstructorRepository.getInstructorById(99)).resolves.toBeNull();
            await expect(InstructorRepository.instructorExists(99)).resolves.toBe(false);
            await expect(InstructorRepository.getInstructorByUserId(99)).resolves.toBeNull();
            await expect(InstructorRepository.instructorExistsByUserId(99)).resolves.toBe(false);
        });
    });

    describe('QuizAnswerRepository', () => {
        it('should run quiz answer repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '8' })
                .mockResolvedValueOnce([{ answer_id: 8, question_id: 2, answer_text: 'A', answer_type: 'short answer', is_correct: true }])
                .mockResolvedValueOnce([{ answer_id: 1, question_id: 2, answer_text: 'A', answer_type: 'short answer', is_correct: true }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}]);

            await expect(QuizAnswerRepository.createQuizAnswer({ questionId: 2, answerText: 'A', answerType: 'short answer', isCorrect: true })).resolves.toBe(8);
            await expect(QuizAnswerRepository.getQuizAnswerById(8)).resolves.toMatchObject({ answerId: 8, questionId: 2 });
            await expect(QuizAnswerRepository.getAllQuizAnswers()).resolves.toHaveLength(1);
            await expect(QuizAnswerRepository.updateQuizAnswer(8, { questionId: 2, answerText: 'A', answerType: 'short answer', isCorrect: true })).resolves.toBe(1);
            await expect(QuizAnswerRepository.deleteQuizAnswer(8)).resolves.toBe(1);
            await expect(QuizAnswerRepository.answerExists(8)).resolves.toBe(true);

            expect(conn.release).toHaveBeenCalledTimes(6);
        });

        it('should return null/false for missing answer records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(QuizAnswerRepository.getQuizAnswerById(77)).resolves.toBeNull();
            await expect(QuizAnswerRepository.answerExists(77)).resolves.toBe(false);
        });
    });

    describe('QuizQuestionRepository', () => {
        it('should run quiz question repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '9' })
                .mockResolvedValueOnce([{ question_id: 9, quiz_id: 1, question_text: 'What is Node?', created_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ question_id: 1, quiz_id: 1, question_text: 'What is Node?', created_at: '2025-01-01' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}]);

            await expect(QuizQuestionRepository.createQuizQuestion({ quizId: 1, questionText: 'What is Node?' })).resolves.toBe(9);
            await expect(QuizQuestionRepository.getQuizQuestionById(9)).resolves.toMatchObject({ questionId: 9, quizId: 1 });
            await expect(QuizQuestionRepository.getAllQuizQuestions()).resolves.toHaveLength(1);
            await expect(QuizQuestionRepository.updateQuizQuestion(9, { quizId: 1, questionText: 'Updated?' })).resolves.toBe(1);
            await expect(QuizQuestionRepository.deleteQuizQuestion(9)).resolves.toBe(1);
            await expect(QuizQuestionRepository.questionExists(9)).resolves.toBe(true);

            expect(conn.release).toHaveBeenCalledTimes(6);
        });

        it('should return null/false for missing question records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(QuizQuestionRepository.getQuizQuestionById(44)).resolves.toBeNull();
            await expect(QuizQuestionRepository.questionExists(44)).resolves.toBe(false);
        });
    });

    describe('QuizRepository', () => {
        it('should run quiz repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '13' })
                .mockResolvedValueOnce([{ quiz_id: 13, course_id: 1, quiz_name: 'Week 1', quiz_description: 'Basics', created_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ quiz_id: 1, course_id: 1, quiz_name: 'Week 1', quiz_description: 'Basics', created_at: '2025-01-01' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{ quiz_id: 1, course_id: 1, quiz_name: 'Week 1', quiz_description: 'Basics', created_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ quiz_id: 1, quiz_name: 'Week 1', course_name: 'Node' }]);

            await expect(QuizRepository.createQuiz({ courseId: 1, quizName: 'Week 1', quizDescription: 'Basics' })).resolves.toBe(13);
            await expect(QuizRepository.getQuizById(13)).resolves.toMatchObject({ quizId: 13, courseId: 1 });
            await expect(QuizRepository.getAllQuizzes()).resolves.toHaveLength(1);
            await expect(QuizRepository.updateQuiz(13, { courseId: 1, quizName: 'Updated', quizDescription: 'More' })).resolves.toBe(1);
            await expect(QuizRepository.deleteQuiz(13)).resolves.toBe(1);
            await expect(QuizRepository.quizExists(13)).resolves.toBe(true);
            await expect(QuizRepository.getQuizzesByCourseId(1)).resolves.toHaveLength(1);
            await expect(QuizRepository.getQuizzesByStudentId(2)).resolves.toEqual([{ quiz_id: 1, quiz_name: 'Week 1', course_name: 'Node' }]);

            expect(conn.release).toHaveBeenCalledTimes(8);
        });

        it('should return null/false for missing quiz records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(QuizRepository.getQuizById(91)).resolves.toBeNull();
            await expect(QuizRepository.quizExists(91)).resolves.toBe(false);
        });
    });

    describe('QuizResultRepository', () => {
        it('should run quiz result repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '17' })
                .mockResolvedValueOnce([{ result_id: 17, quiz_id: 1, student_id: 2, score: 90, completed_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ result_id: 1, quiz_id: 1, student_id: 2, score: 90, completed_at: '2025-01-01' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{}]);

            await expect(QuizResultRepository.createQuizResult({ quizId: 1, studentId: 2, score: 90 })).resolves.toBe(17);
            await expect(QuizResultRepository.getQuizResultById(17)).resolves.toMatchObject({ resultId: 17, quizId: 1 });
            await expect(QuizResultRepository.getAllQuizResults()).resolves.toHaveLength(1);
            await expect(QuizResultRepository.updateQuizResult(17, { quizId: 1, studentId: 2, score: 95 })).resolves.toBe(1);
            await expect(QuizResultRepository.deleteQuizResult(17)).resolves.toBe(1);
            await expect(QuizResultRepository.resultExists(17)).resolves.toBe(true);
            await expect(QuizResultRepository.resultExistsByStudentAndQuiz(2, 1)).resolves.toBe(true);

            expect(conn.release).toHaveBeenCalledTimes(7);
        });

        it('should return null/false for missing result records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(QuizResultRepository.getQuizResultById(88)).resolves.toBeNull();
            await expect(QuizResultRepository.resultExists(88)).resolves.toBe(false);
            await expect(QuizResultRepository.resultExistsByStudentAndQuiz(3, 5)).resolves.toBe(false);
        });
    });

    describe('StudentRepository', () => {
        it('should run student repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '14' })
                .mockResolvedValueOnce([{ studend_id: 14, user_id: 2, stu_FName: 'Jane', stu_LName: 'Doe', dob: '2000-01-01', profile_picture: 'https://example.com/p.png' }])
                .mockResolvedValueOnce([{ studend_id: 1, user_id: 2, stu_FName: 'Jane', stu_LName: 'Doe', dob: '2000-01-01', profile_picture: 'https://example.com/p.png' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{ studend_id: 14, user_id: 2, stu_FName: 'Jane', stu_LName: 'Doe', dob: '2000-01-01', profile_picture: 'https://example.com/p.png' }])
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{ course_id: 1 }]);

            await expect(StudentRepository.createStudent({ userId: 2, stuFName: 'Jane', stuLName: 'Doe', dob: '2000-01-01', profilePicture: 'https://example.com/p.png' })).resolves.toBe(14);
            await expect(StudentRepository.getStudentById(14)).resolves.toMatchObject({ studentId: 14, userId: 2 });
            await expect(StudentRepository.getAllStudents()).resolves.toHaveLength(1);
            await expect(StudentRepository.updateStudent(14, { userId: 2, stuFName: 'Jane', stuLName: 'Doe', dob: '2000-01-01', profilePicture: 'https://example.com/p.png' })).resolves.toBe(1);
            await expect(StudentRepository.deleteStudent(14)).resolves.toBe(1);
            await expect(StudentRepository.studentExists(14)).resolves.toBe(true);
            await expect(StudentRepository.getStudentByUserId(2)).resolves.toMatchObject({ studentId: 14, userId: 2 });
            await expect(StudentRepository.studentExistsByUserId(2)).resolves.toBe(true);
            await expect(StudentRepository.getStudentCourses(14)).resolves.toEqual([{ course_id: 1 }]);

            expect(conn.release).toHaveBeenCalledTimes(9);
        });

        it('should return null/false for missing student records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(StudentRepository.getStudentById(404)).resolves.toBeNull();
            await expect(StudentRepository.studentExists(404)).resolves.toBe(false);
            await expect(StudentRepository.getStudentByUserId(404)).resolves.toBeNull();
            await expect(StudentRepository.studentExistsByUserId(404)).resolves.toBe(false);
        });
    });

    describe('UserRepository', () => {
        it('should run user repository workflows', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce({ insertId: '20' })
                .mockResolvedValueOnce([{ user_id: 20, email: 'user@example.com', password_hash: 'hash', user_type: 'student', create_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ user_id: 20, email: 'user@example.com', password_hash: 'hash', user_type: 'student', create_at: '2025-01-01' }])
                .mockResolvedValueOnce([{ user_id: 20, email: 'user@example.com', password_hash: 'hash', user_type: 'student', create_at: '2025-01-01' }])
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce({ affectedRows: 1 });

            await expect(UserRepository.createUser({ email: 'user@example.com', passwordHash: 'hash', userType: 'student' })).resolves.toBe(20);
            await expect(UserRepository.getUserById(20)).resolves.toMatchObject({ userId: 20, email: 'user@example.com' });
            await expect(UserRepository.getUserByEmail('user@example.com')).resolves.toMatchObject({ user_id: 20, email: 'user@example.com' });
            await expect(UserRepository.getAllUsers()).resolves.toHaveLength(1);
            await expect(UserRepository.updateUser(20, { email: 'new@example.com', passwordHash: 'new-hash', userType: 'instructor' })).resolves.toBe(1);
            await expect(UserRepository.deleteUser(20)).resolves.toBe(1);
            await expect(UserRepository.emailExists('user@example.com')).resolves.toBe(true);
            await expect(UserRepository.userExistsById(20)).resolves.toBe(true);
            await expect(UserRepository.updatePasswordHash(20, 'updated-hash')).resolves.toBe(1);

            expect(conn.release).toHaveBeenCalledTimes(9);
        });

        it('should return null/false for missing user records', async () => {
            const conn = mockConnection();
            conn.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await expect(UserRepository.getUserById(404)).resolves.toBeNull();
            await expect(UserRepository.getUserByEmail('missing@example.com')).resolves.toBeNull();
            await expect(UserRepository.emailExists('missing@example.com')).resolves.toBe(false);
            await expect(UserRepository.userExistsById(404)).resolves.toBe(false);
        });

        it('should skip update query when no fields are provided', async () => {
            const conn = mockConnection();

            await expect(UserRepository.updateUser(20, {})).resolves.toBe(0);

            expect(conn.query).not.toHaveBeenCalled();
            expect(conn.release).toHaveBeenCalledTimes(1);
        });

        it('should support excluding user id in email existence checks', async () => {
            const conn = mockConnection();
            conn.query.mockResolvedValueOnce([{}]);

            await expect(UserRepository.emailExists('user@example.com', 20)).resolves.toBe(true);
            expect(conn.query).toHaveBeenCalledWith(
                expect.stringContaining('AND user_id != ?'),
                ['user@example.com', 20]
            );
        });
    });

    describe('Repository connection failures', () => {
        const error = new Error('connection unavailable');

        const cases = [
            ['CategoryRepository.createCategory', () => CategoryRepository.createCategory({ categoryName: 'Programming', description: 'Courses' })],
            ['CategoryRepository.getCategoryById', () => CategoryRepository.getCategoryById(1)],
            ['CategoryRepository.getAllCategories', () => CategoryRepository.getAllCategories()],
            ['CategoryRepository.updateCategory', () => CategoryRepository.updateCategory(1, { categoryName: 'Programming', description: 'Courses' })],
            ['CategoryRepository.deleteCategory', () => CategoryRepository.deleteCategory(1)],
            ['CategoryRepository.categoryExists', () => CategoryRepository.categoryExists(1)],
            ['CategoryRepository.getCategoryCourses', () => CategoryRepository.getCategoryCourses(1)],
            ['CategoryRepository.getCategoryInstructors', () => CategoryRepository.getCategoryInstructors(1)],
            ['CourseMaterialRepository.createCourseMaterial', () => CourseMaterialRepository.createCourseMaterial({ courseId: 1, title: 'Slides', materialType: 'pdf', filePath: 'https://example.com/slides.pdf' })],
            ['CourseMaterialRepository.getCourseMaterialById', () => CourseMaterialRepository.getCourseMaterialById(1)],
            ['CourseMaterialRepository.getAllCourseMaterials', () => CourseMaterialRepository.getAllCourseMaterials()],
            ['CourseMaterialRepository.updateCourseMaterial', () => CourseMaterialRepository.updateCourseMaterial(1, { courseId: 1, title: 'Slides', materialType: 'pdf', filePath: 'https://example.com/slides.pdf' })],
            ['CourseMaterialRepository.deleteCourseMaterial', () => CourseMaterialRepository.deleteCourseMaterial(1)],
            ['CourseMaterialRepository.materialExists', () => CourseMaterialRepository.materialExists(1)],
            ['CourseMaterialRepository.getMaterialsByCourseId', () => CourseMaterialRepository.getMaterialsByCourseId(1)],
            ['CourseRepository.createCourse', () => CourseRepository.createCourse({ instructorId: 1, categorieId: 1, courseName: 'Node', description: 'Basics' })],
            ['CourseRepository.getCourseById', () => CourseRepository.getCourseById(1)],
            ['CourseRepository.getAllCourses', () => CourseRepository.getAllCourses()],
            ['CourseRepository.updateCourse', () => CourseRepository.updateCourse(1, { instructorId: 1, categorieId: 1, courseName: 'Node', description: 'Basics' })],
            ['CourseRepository.deleteCourse', () => CourseRepository.deleteCourse(1)],
            ['CourseRepository.courseExistsById', () => CourseRepository.courseExistsById(1)],
            ['CourseRepository.getInstructorByCourseId', () => CourseRepository.getInstructorByCourseId(1)],
            ['CourseRepository.getStudentsOfCourse', () => CourseRepository.getStudentsOfCourse(1)],
            ['CourseRepository.getCoursesByInstructorId', () => CourseRepository.getCoursesByInstructorId(1)],
            ['CourseRepository.getStudentEnrolledCourses', () => CourseRepository.getStudentEnrolledCourses(1)],
            ['EnrollmentRepository.createEnrollment', () => EnrollmentRepository.createEnrollment({ studentId: 1, courseId: 1, status: 'enrolled' })],
            ['EnrollmentRepository.getEnrollmentById', () => EnrollmentRepository.getEnrollmentById(1)],
            ['EnrollmentRepository.getAllEnrollments', () => EnrollmentRepository.getAllEnrollments()],
            ['EnrollmentRepository.updateEnrollment', () => EnrollmentRepository.updateEnrollment(1, { studentId: 1, courseId: 1, status: 'completed' })],
            ['EnrollmentRepository.deleteEnrollment', () => EnrollmentRepository.deleteEnrollment(1)],
            ['EnrollmentRepository.enrollmentExists', () => EnrollmentRepository.enrollmentExists(1)],
            ['EnrollmentRepository.enrollmentExistsByStudentAndCourse', () => EnrollmentRepository.enrollmentExistsByStudentAndCourse(1, 1)],
            ['InstructorRepository.createInstructor', () => InstructorRepository.createInstructor({ userId: 1, insFName: 'John', insLName: 'Doe', bio: 'Bio', profilePicture: 'https://example.com/p.png' })],
            ['InstructorRepository.getInstructorById', () => InstructorRepository.getInstructorById(1)],
            ['InstructorRepository.getAllInstructors', () => InstructorRepository.getAllInstructors()],
            ['InstructorRepository.updateInstructor', () => InstructorRepository.updateInstructor(1, { userId: 1, insFName: 'John', insLName: 'Doe', bio: 'Bio', profilePicture: 'https://example.com/p.png' })],
            ['InstructorRepository.deleteInstructor', () => InstructorRepository.deleteInstructor(1)],
            ['InstructorRepository.instructorExists', () => InstructorRepository.instructorExists(1)],
            ['InstructorRepository.getInstructorByUserId', () => InstructorRepository.getInstructorByUserId(1)],
            ['InstructorRepository.instructorExistsByUserId', () => InstructorRepository.instructorExistsByUserId(1)],
            ['InstructorRepository.getInstructorCourses', () => InstructorRepository.getInstructorCourses(1)],
            ['QuizAnswerRepository.createQuizAnswer', () => QuizAnswerRepository.createQuizAnswer({ questionId: 1, answerText: 'A', answerType: 'short answer', isCorrect: true })],
            ['QuizAnswerRepository.getQuizAnswerById', () => QuizAnswerRepository.getQuizAnswerById(1)],
            ['QuizAnswerRepository.getAllQuizAnswers', () => QuizAnswerRepository.getAllQuizAnswers()],
            ['QuizAnswerRepository.updateQuizAnswer', () => QuizAnswerRepository.updateQuizAnswer(1, { questionId: 1, answerText: 'A', answerType: 'short answer', isCorrect: true })],
            ['QuizAnswerRepository.deleteQuizAnswer', () => QuizAnswerRepository.deleteQuizAnswer(1)],
            ['QuizAnswerRepository.answerExists', () => QuizAnswerRepository.answerExists(1)],
            ['QuizQuestionRepository.createQuizQuestion', () => QuizQuestionRepository.createQuizQuestion({ quizId: 1, questionText: 'What is Node?' })],
            ['QuizQuestionRepository.getQuizQuestionById', () => QuizQuestionRepository.getQuizQuestionById(1)],
            ['QuizQuestionRepository.getAllQuizQuestions', () => QuizQuestionRepository.getAllQuizQuestions()],
            ['QuizQuestionRepository.updateQuizQuestion', () => QuizQuestionRepository.updateQuizQuestion(1, { quizId: 1, questionText: 'Updated question' })],
            ['QuizQuestionRepository.deleteQuizQuestion', () => QuizQuestionRepository.deleteQuizQuestion(1)],
            ['QuizQuestionRepository.questionExists', () => QuizQuestionRepository.questionExists(1)],
            ['QuizRepository.createQuiz', () => QuizRepository.createQuiz({ courseId: 1, quizName: 'Week 1', quizDescription: 'Basics' })],
            ['QuizRepository.getQuizById', () => QuizRepository.getQuizById(1)],
            ['QuizRepository.getAllQuizzes', () => QuizRepository.getAllQuizzes()],
            ['QuizRepository.updateQuiz', () => QuizRepository.updateQuiz(1, { courseId: 1, quizName: 'Week 1', quizDescription: 'Basics' })],
            ['QuizRepository.deleteQuiz', () => QuizRepository.deleteQuiz(1)],
            ['QuizRepository.quizExists', () => QuizRepository.quizExists(1)],
            ['QuizRepository.getQuizzesByCourseId', () => QuizRepository.getQuizzesByCourseId(1)],
            ['QuizRepository.getQuizzesByStudentId', () => QuizRepository.getQuizzesByStudentId(1)],
            ['QuizResultRepository.createQuizResult', () => QuizResultRepository.createQuizResult({ quizId: 1, studentId: 1, score: 80 })],
            ['QuizResultRepository.getQuizResultById', () => QuizResultRepository.getQuizResultById(1)],
            ['QuizResultRepository.getAllQuizResults', () => QuizResultRepository.getAllQuizResults()],
            ['QuizResultRepository.updateQuizResult', () => QuizResultRepository.updateQuizResult(1, { quizId: 1, studentId: 1, score: 90 })],
            ['QuizResultRepository.deleteQuizResult', () => QuizResultRepository.deleteQuizResult(1)],
            ['QuizResultRepository.resultExists', () => QuizResultRepository.resultExists(1)],
            ['QuizResultRepository.resultExistsByStudentAndQuiz', () => QuizResultRepository.resultExistsByStudentAndQuiz(1, 1)],
            ['StudentRepository.createStudent', () => StudentRepository.createStudent({ userId: 1, stuFName: 'Jane', stuLName: 'Doe', dob: '2000-01-01', profilePicture: 'https://example.com/p.png' })],
            ['StudentRepository.getStudentById', () => StudentRepository.getStudentById(1)],
            ['StudentRepository.getAllStudents', () => StudentRepository.getAllStudents()],
            ['StudentRepository.updateStudent', () => StudentRepository.updateStudent(1, { userId: 1, stuFName: 'Jane', stuLName: 'Doe', dob: '2000-01-01', profilePicture: 'https://example.com/p.png' })],
            ['StudentRepository.deleteStudent', () => StudentRepository.deleteStudent(1)],
            ['StudentRepository.studentExists', () => StudentRepository.studentExists(1)],
            ['StudentRepository.getStudentByUserId', () => StudentRepository.getStudentByUserId(1)],
            ['StudentRepository.studentExistsByUserId', () => StudentRepository.studentExistsByUserId(1)],
            ['StudentRepository.getStudentCourses', () => StudentRepository.getStudentCourses(1)],
            ['UserRepository.createUser', () => UserRepository.createUser({ email: 'user@example.com', passwordHash: 'hash', userType: 'student' })],
            ['UserRepository.getUserById', () => UserRepository.getUserById(1)],
            ['UserRepository.getUserByEmail', () => UserRepository.getUserByEmail('user@example.com')],
            ['UserRepository.getAllUsers', () => UserRepository.getAllUsers()],
            ['UserRepository.updateUser', () => UserRepository.updateUser(1, { email: 'updated@example.com' })],
            ['UserRepository.deleteUser', () => UserRepository.deleteUser(1)],
            ['UserRepository.emailExists', () => UserRepository.emailExists('user@example.com')],
            ['UserRepository.userExistsById', () => UserRepository.userExistsById(1)],
            ['UserRepository.updatePasswordHash', () => UserRepository.updatePasswordHash(1, 'new-hash')],
        ];

        it.each(cases)('should propagate connection errors for %s', async (_name, invoke) => {
            pool.getConnection.mockRejectedValue(error);

            await expect(invoke()).rejects.toThrow('connection unavailable');
        });
    });
});
