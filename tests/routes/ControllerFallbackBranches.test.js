const request = require('supertest');
const {
    authHeader,
    instructorAuthHeader,
} = require('../helpers/routeTestUtils');

jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/CategoryService', () => ({
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    getCategoryCourses: jest.fn(),
    getCategoryInstructors: jest.fn(),
}));

jest.mock('../../src/services/CourseService', () => ({
    getAllCourses: jest.fn(),
    getCourseById: jest.fn(),
    createCourse: jest.fn(),
    updateCourse: jest.fn(),
    deleteCourse: jest.fn(),
    getInstructorByCourseId: jest.fn(),
    getStudentsOfCourse: jest.fn(),
}));

jest.mock('../../src/services/CourseMaterialService', () => ({
    getAllCourseMaterials: jest.fn(),
    getCourseMaterialById: jest.fn(),
    createCourseMaterial: jest.fn(),
    updateCourseMaterial: jest.fn(),
    deleteCourseMaterial: jest.fn(),
}));

jest.mock('../../src/services/EnrollmentService', () => ({
    getAllEnrollments: jest.fn(),
    getEnrollmentById: jest.fn(),
    createEnrollment: jest.fn(),
    updateEnrollment: jest.fn(),
    deleteEnrollment: jest.fn(),
}));

jest.mock('../../src/services/InstructorService', () => ({
    getAllInstructors: jest.fn(),
    getInstructorById: jest.fn(),
    createInstructor: jest.fn(),
    updateInstructor: jest.fn(),
    deleteInstructor: jest.fn(),
    getInstructorCourses: jest.fn(),
}));

jest.mock('../../src/services/QuizService', () => ({
    getAllQuizzes: jest.fn(),
    getQuizById: jest.fn(),
    createQuiz: jest.fn(),
    updateQuiz: jest.fn(),
    deleteQuiz: jest.fn(),
}));

jest.mock('../../src/services/QuizQuestionService', () => ({
    getAllQuizQuestions: jest.fn(),
    getQuizQuestionById: jest.fn(),
    createQuizQuestion: jest.fn(),
    updateQuizQuestion: jest.fn(),
    deleteQuizQuestion: jest.fn(),
}));

jest.mock('../../src/services/QuizAnswerService', () => ({
    getAllQuizAnswers: jest.fn(),
    getQuizAnswerById: jest.fn(),
    createQuizAnswer: jest.fn(),
    updateQuizAnswer: jest.fn(),
    deleteQuizAnswer: jest.fn(),
}));

jest.mock('../../src/services/QuizResultService', () => ({
    getAllQuizResults: jest.fn(),
    getQuizResultById: jest.fn(),
    createQuizResult: jest.fn(),
    updateQuizResult: jest.fn(),
    deleteQuizResult: jest.fn(),
}));

jest.mock('../../src/services/StudentService', () => ({
    getAllStudents: jest.fn(),
    getStudentById: jest.fn(),
    createStudent: jest.fn(),
    updateStudent: jest.fn(),
    deleteStudent: jest.fn(),
    getStudentCourses: jest.fn(),
}));

jest.mock('../../src/services/UserService', () => ({
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    login: jest.fn(),
    changePassword: jest.fn(),
}));

const CategoryService = require('../../src/services/CategoryService');
const CourseService = require('../../src/services/CourseService');
const CourseMaterialService = require('../../src/services/CourseMaterialService');
const EnrollmentService = require('../../src/services/EnrollmentService');
const InstructorService = require('../../src/services/InstructorService');
const QuizService = require('../../src/services/QuizService');
const QuizQuestionService = require('../../src/services/QuizQuestionService');
const QuizAnswerService = require('../../src/services/QuizAnswerService');
const QuizResultService = require('../../src/services/QuizResultService');
const StudentService = require('../../src/services/StudentService');
const UserService = require('../../src/services/UserService');

const app = require('../../src/app');

const coursePayload = {
    instructorId: 2,
    categorieId: 1,
    courseName: 'Node Fundamentals',
    description: 'Backend basics',
};

const materialPayload = {
    courseId: 3,
    title: 'Week 1 Slides',
    materialType: 'pdf',
    filePath: 'https://example.com/week1.pdf',
};

const enrollmentPayload = {
    studentId: 5,
    courseId: 3,
    status: 'enrolled',
};

const instructorPayload = {
    userId: 2,
    insFName: 'John',
    insLName: 'Doe',
    bio: 'Experienced instructor',
    profilePicture: 'https://example.com/john.png',
};

const quizPayload = {
    courseId: 3,
    quizName: 'Week 1 Quiz',
    quizDescription: 'Covers first module',
};

const questionPayload = {
    quizId: 2,
    questionText: 'What is a BST?',
};

const answerPayload = {
    questionId: 2,
    answerText: 'Binary Search Tree',
    answerType: 'short answer',
    isCorrect: true,
};

const resultPayload = {
    quizId: 2,
    studentId: 5,
    score: 90,
};

const studentPayload = {
    userId: 7,
    stuFName: 'Jane',
    stuLName: 'Doe',
    dob: '2000-01-01',
    profilePicture: 'https://example.com/jane.png',
};

const userPayload = {
    email: 'newuser@example.com',
    password: 'Strong@1234',
    userType: 'student',
};

const assertControllerFallback = async (mockFn, buildRequest) => {
    mockFn.mockRejectedValue(new Error('Unexpected failure'));
    const res = await buildRequest();

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
        success: false,
        message: 'Unexpected failure',
    });
};

beforeEach(() => {
    jest.clearAllMocks();
});

const fallbackCases = [
    ['Category routes – GET /api/categories/:id', CategoryService.getCategoryById, () => request(app).get('/api/categories/1')],
    ['Category routes – PUT /api/categories/:id', CategoryService.updateCategory, () => request(app).put('/api/categories/1').set(instructorAuthHeader()).send({ categoryName: 'Programming', description: 'Courses' })],
    ['Category routes – DELETE /api/categories/:id', CategoryService.deleteCategory, () => request(app).delete('/api/categories/1').set(instructorAuthHeader())],
    ['Category routes – GET /api/categories/courses/:id', CategoryService.getCategoryCourses, () => request(app).get('/api/categories/courses/1')],
    ['Category routes – GET /api/categories/instructor/:id', CategoryService.getCategoryInstructors, () => request(app).get('/api/categories/instructor/1')],

    ['Course routes – GET /api/courses/:id', CourseService.getCourseById, () => request(app).get('/api/courses/1')],
    ['Course routes – POST /api/courses', CourseService.createCourse, () => request(app).post('/api/courses').set(instructorAuthHeader()).send(coursePayload)],
    ['Course routes – PUT /api/courses/:id', CourseService.updateCourse, () => request(app).put('/api/courses/1').set(instructorAuthHeader()).send(coursePayload)],
    ['Course routes – DELETE /api/courses/:id', CourseService.deleteCourse, () => request(app).delete('/api/courses/1').set(instructorAuthHeader())],
    ['Course routes – GET /api/courses/instructorByCourseId/:id', CourseService.getInstructorByCourseId, () => request(app).get('/api/courses/instructorByCourseId/1')],
    ['Course routes – GET /api/courses/stdOfCourse/:id', CourseService.getStudentsOfCourse, () => request(app).get('/api/courses/stdOfCourse/1')],

    ['Course Material routes – GET /api/materials/:id', CourseMaterialService.getCourseMaterialById, () => request(app).get('/api/materials/1')],
    ['Course Material routes – POST /api/materials', CourseMaterialService.createCourseMaterial, () => request(app).post('/api/materials').set(instructorAuthHeader()).send(materialPayload)],
    ['Course Material routes – PUT /api/materials/:id', CourseMaterialService.updateCourseMaterial, () => request(app).put('/api/materials/1').set(instructorAuthHeader()).send(materialPayload)],
    ['Course Material routes – DELETE /api/materials/:id', CourseMaterialService.deleteCourseMaterial, () => request(app).delete('/api/materials/1').set(instructorAuthHeader())],

    ['Enrollment routes – GET /api/enrollments/:id', EnrollmentService.getEnrollmentById, () => request(app).get('/api/enrollments/1').set(authHeader())],
    ['Enrollment routes – POST /api/enrollments', EnrollmentService.createEnrollment, () => request(app).post('/api/enrollments').set(authHeader()).send(enrollmentPayload)],
    ['Enrollment routes – PUT /api/enrollments/:id', EnrollmentService.updateEnrollment, () => request(app).put('/api/enrollments/1').set(authHeader()).send(enrollmentPayload)],
    ['Enrollment routes – DELETE /api/enrollments/:id', EnrollmentService.deleteEnrollment, () => request(app).delete('/api/enrollments/1').set(authHeader())],

    ['Instructor routes – GET /api/instructors/:id', InstructorService.getInstructorById, () => request(app).get('/api/instructors/1')],
    ['Instructor routes – POST /api/instructors', InstructorService.createInstructor, () => request(app).post('/api/instructors').set(instructorAuthHeader()).send(instructorPayload)],
    ['Instructor routes – PUT /api/instructors/:id', InstructorService.updateInstructor, () => request(app).put('/api/instructors/1').set(instructorAuthHeader()).send(instructorPayload)],
    ['Instructor routes – DELETE /api/instructors/:id', InstructorService.deleteInstructor, () => request(app).delete('/api/instructors/1').set(instructorAuthHeader())],
    ['Instructor routes – GET /api/instructors/courses/:id', InstructorService.getInstructorCourses, () => request(app).get('/api/instructors/courses/1')],

    ['Quiz routes – GET /api/quizzes/:id', QuizService.getQuizById, () => request(app).get('/api/quizzes/1')],
    ['Quiz routes – PUT /api/quizzes/:id', QuizService.updateQuiz, () => request(app).put('/api/quizzes/1').set(instructorAuthHeader()).send(quizPayload)],
    ['Quiz routes – DELETE /api/quizzes/:id', QuizService.deleteQuiz, () => request(app).delete('/api/quizzes/1').set(instructorAuthHeader())],

    ['Quiz Question routes – GET /api/questions/:id', QuizQuestionService.getQuizQuestionById, () => request(app).get('/api/questions/1')],
    ['Quiz Question routes – PUT /api/questions/:id', QuizQuestionService.updateQuizQuestion, () => request(app).put('/api/questions/1').set(instructorAuthHeader()).send(questionPayload)],
    ['Quiz Question routes – DELETE /api/questions/:id', QuizQuestionService.deleteQuizQuestion, () => request(app).delete('/api/questions/1').set(instructorAuthHeader())],

    ['Quiz Answer routes – GET /api/answers/:id', QuizAnswerService.getQuizAnswerById, () => request(app).get('/api/answers/1')],
    ['Quiz Answer routes – POST /api/answers', QuizAnswerService.createQuizAnswer, () => request(app).post('/api/answers').set(authHeader()).send(answerPayload)],
    ['Quiz Answer routes – PUT /api/answers/:id', QuizAnswerService.updateQuizAnswer, () => request(app).put('/api/answers/1').set(instructorAuthHeader()).send(answerPayload)],
    ['Quiz Answer routes – DELETE /api/answers/:id', QuizAnswerService.deleteQuizAnswer, () => request(app).delete('/api/answers/1').set(instructorAuthHeader())],

    ['Quiz Result routes – GET /api/results/:id', QuizResultService.getQuizResultById, () => request(app).get('/api/results/1').set(authHeader())],
    ['Quiz Result routes – POST /api/results', QuizResultService.createQuizResult, () => request(app).post('/api/results').set(authHeader()).send(resultPayload)],
    ['Quiz Result routes – PUT /api/results/:id', QuizResultService.updateQuizResult, () => request(app).put('/api/results/1').set(authHeader()).send(resultPayload)],
    ['Quiz Result routes – DELETE /api/results/:id', QuizResultService.deleteQuizResult, () => request(app).delete('/api/results/1').set(authHeader())],

    ['Student routes – GET /api/students/:id', StudentService.getStudentById, () => request(app).get('/api/students/1').set(authHeader())],
    ['Student routes – POST /api/students', StudentService.createStudent, () => request(app).post('/api/students').set(authHeader()).send(studentPayload)],
    ['Student routes – PUT /api/students/:id', StudentService.updateStudent, () => request(app).put('/api/students/1').set(authHeader()).send(studentPayload)],
    ['Student routes – DELETE /api/students/:id', StudentService.deleteStudent, () => request(app).delete('/api/students/1').set(instructorAuthHeader())],
    ['Student routes – GET /api/students/studentCourses/:id', StudentService.getStudentCourses, () => request(app).get('/api/students/studentCourses/1').set(authHeader())],

    ['User routes – GET /api/users/:id', UserService.getUserById, () => request(app).get('/api/users/1').set(authHeader())],
    ['User routes – GET /api/users/email/:email', UserService.getUserByEmail, () => request(app).get('/api/users/email/student@example.com').set(authHeader())],
    ['User routes – POST /api/users', UserService.createUser, () => request(app).post('/api/users').send(userPayload)],
    ['User routes – PUT /api/users/:id', UserService.updateUser, () => request(app).put('/api/users/1').set(instructorAuthHeader()).send(userPayload)],
    ['User routes – DELETE /api/users/:id', UserService.deleteUser, () => request(app).delete('/api/users/1').set(instructorAuthHeader())],
    ['User routes – POST /api/users/login', UserService.login, () => request(app).post('/api/users/login').send({ email: 'teacher@example.com', password: 'Strong@1234' })],
];

for (const [title, mockFn, requestBuilder] of fallbackCases) {
    describe(title, () => {
        it('should return 500 when service fails unexpectedly', async () => {
            await assertControllerFallback(mockFn, requestBuilder);
        });
    });
}
