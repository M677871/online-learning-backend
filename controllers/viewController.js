const moment = require('moment');

const Course = require('../models/courseModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Student = require('../models/studentModel');
const Instructor = require('../models/instructorModel');
const Enrollement = require('../models/enrollementModel');
const Quiz = require('../models/quizModel');
const CourseMaterial = require('../models/courseMaterialModel');

const courseService = require('../services/courseService');
const categoryService = require('../services/categoryService');
const userService = require('../services/userService');
const studentService = require('../services/studentService');
const instructorService = require('../services/instructorService');
const enrollementService = require('../services/enrollementService');
const quizService = require('../services/quizService');
const courseMaterialService = require('../services/courseMaterialService');

class ViewController {
  static async dashboard(req, res) {
    try {
      const [
        rawCourses,
        rawStudents,
        rawInstructors,
        rawQuizzes,
        rawCategories,
        rawEnrollments
      ] = await Promise.all([
        courseService.getAllCourses(),
        studentService.getAllStudents(),
        instructorService.getInstructors(),
        quizService.getAllQuizzes(),
        categoryService.getAllCategories(),
        enrollementService.getAllEnrollements()
      ]);

      const courses = Array.isArray(rawCourses) ? rawCourses : [];
      const students = Array.isArray(rawStudents) ? rawStudents : [];
      const instructors = Array.isArray(rawInstructors) ? rawInstructors : [];
      const quizzes = Array.isArray(rawQuizzes) ? rawQuizzes : [];
      const categories = Array.isArray(rawCategories) ? rawCategories : [];
      const enrollments = Array.isArray(rawEnrollments) ? rawEnrollments : [];

      const stats = {
        courses: courses.length,
        students: students.length,
        instructors: instructors.length,
        quizzes: quizzes.length,
        categories: categories.length,
        enrollments: enrollments.length
      };

      res.render('dashboard', {
        layout: 'layouts/main',
        title: 'Overview',
        user: req.session.user,
        active: 'dashboard',
        currentPath: '/dashboard',
        stats,
        recentCourses: courses.slice(0, 3),
        recentQuizzes: quizzes.slice(0, 3)
      });
    } catch (error) {
      console.error('Error rendering dashboard', error);
      return res.status(500).send('Unable to load dashboard right now.');
    }
  }

  // --- Courses ---
  static async coursesPage(req, res) {
    try {
      const editId = req.query.edit;
      const [rawCourses, rawCategories, rawInstructors] = await Promise.all([
        courseService.getAllCourses(),
        categoryService.getAllCategories(),
        instructorService.getInstructors()
      ]);
      const courses = rawCourses || [];
      const categories = rawCategories || [];
      const instructors = rawInstructors || [];

      const editingItem = editId ? await courseService.getCourseById(editId) : null;

      const rows = courses.map((c) => ({
        id: c.courseId,
        name: c.courseName,
        category: c.categorieId,
        instructor: c.instructorId,
        description: c.description
      }));

      res.render('entities/manage', {
        layout: 'layouts/main',
        title: 'Courses',
        user: req.session.user,
        active: 'courses',
        currentPath: '/courses',
        entity: 'course',
        rows,
        columns: [
          { key: 'name', label: 'Course' },
          { key: 'category', label: 'Category' },
          { key: 'instructor', label: 'Instructor' }
        ],
        idKey: 'id',
        editId,
        formAction: editId ? `/courses/${editId}?_method=PUT` : '/courses',
        formMethod: editId ? 'PUT' : 'POST',
        formTitle: editId ? 'Edit course' : 'Create course',
        formFields: [
          { name: 'courseName', label: 'Course name', type: 'text', value: editingItem?.courseName || '', required: true },
          { name: 'description', label: 'Description', type: 'textarea', value: editingItem?.description || '', required: true },
          {
            name: 'categorieId',
            label: 'Category',
            type: 'select',
            options: categories.map((cat) => ({ value: cat.categoryId, label: cat.categoryName })),
            value: editingItem?.categorieId || ''
          },
          {
            name: 'instructorId',
            label: 'Instructor',
            type: 'select',
            options: instructors.map((ins) => ({ value: ins.instructorId, label: `${ins.insFName} ${ins.insLName}` })),
            value: editingItem?.instructorId || ''
          }
        ]
      });
    } catch (error) {
      console.error('Error rendering courses page', error);
      req.flash('error', error.message);
      res.redirect('/dashboard');
    }
  }

  static async saveCourse(req, res) {
    const isEdit = Boolean(req.params.id);
    try {
      const { instructorId, categorieId, courseName, description } = req.body;
      const course = new Course(
        isEdit ? req.params.id : 0,
        instructorId,
        categorieId,
        courseName,
        description,
        moment().format('YYYY-MM-DD')
      );
      if (isEdit) {
        await courseService.updateCourse(course);
        req.flash('success', 'Course updated successfully.');
      } else {
        await courseService.createCourse(course);
        req.flash('success', 'Course created successfully.');
      }
    } catch (error) {
      console.error('Error saving course', error);
      req.flash('error', error.message);
      return res.redirect(isEdit ? `/courses?edit=${req.params.id}` : '/courses');
    }
    res.redirect('/courses');
  }

  static async deleteCourse(req, res) {
    try {
      await courseService.deleteCourse(req.params.id);
      req.flash('success', 'Course deleted.');
    } catch (error) {
      console.error('Error deleting course', error);
      req.flash('error', error.message);
    }
    res.redirect('/courses');
  }

  // --- Categories ---
  static async categoriesPage(req, res) {
    try {
      const editId = req.query.edit;
      const categories = (await categoryService.getAllCategories()) || [];
      const editingItem = editId ? await categoryService.getCategoryById(editId) : null;

      const rows = categories.map((c) => ({
        id: c.categoryId,
        name: c.categoryName,
        description: c.description
      }));

      res.render('entities/manage', {
        layout: 'layouts/main',
        title: 'Categories',
        user: req.session.user,
        active: 'categories',
        currentPath: '/categories',
        entity: 'category',
        rows,
        columns: [
          { key: 'name', label: 'Category' },
          { key: 'description', label: 'Description' }
        ],
        idKey: 'id',
        editId,
        formAction: editId ? `/categories/${editId}?_method=PUT` : '/categories',
        formMethod: editId ? 'PUT' : 'POST',
        formTitle: editId ? 'Edit category' : 'Create category',
        formFields: [
          { name: 'categoryName', label: 'Name', type: 'text', value: editingItem?.categoryName || '', required: true },
          { name: 'description', label: 'Description', type: 'textarea', value: editingItem?.description || '', required: true }
        ]
      });
    } catch (error) {
      console.error('Error rendering categories', error);
      req.flash('error', error.message);
      res.redirect('/dashboard');
    }
  }

  static async saveCategory(req, res) {
    const isEdit = Boolean(req.params.id);
    try {
      const { categoryName, description } = req.body;
      const category = new Category(isEdit ? req.params.id : 0, categoryName, description);
      if (isEdit) {
        await categoryService.updateCategory(category);
        req.flash('success', 'Category updated.');
      } else {
        await categoryService.createCategory(category);
        req.flash('success', 'Category created.');
      }
    } catch (error) {
      console.error('Error saving category', error);
      req.flash('error', error.message);
      return res.redirect(isEdit ? `/categories?edit=${req.params.id}` : '/categories');
    }
    res.redirect('/categories');
  }

  static async deleteCategory(req, res) {
    try {
      await categoryService.deleteCategory(req.params.id);
      req.flash('success', 'Category deleted.');
    } catch (error) {
      console.error('Error deleting category', error);
      req.flash('error', error.message);
    }
    res.redirect('/categories');
  }

  // --- Users ---
  static async usersPage(req, res) {
    try {
      const editId = req.query.edit;
      const isEdit = Boolean(editId);
      const users = (await userService.getAllUsers()) || [];
      const editingItem = editId ? await userService.getUserById(editId) : null;

      const rows = users.map((u) => ({
        id: u.userId,
        email: u.email,
        role: u.userType,
        created: u.createdAt
      }));

      res.render('entities/manage', {
        layout: 'layouts/main',
        title: 'Users',
        user: req.session.user,
        active: 'users',
        currentPath: '/users',
        entity: 'user',
        rows,
        columns: [
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'created', label: 'Created' }
        ],
        idKey: 'id',
        editId,
        formAction: editId ? `/users/${editId}?_method=PUT` : '/users',
        formMethod: editId ? 'PUT' : 'POST',
        formTitle: editId ? 'Edit user' : 'Create user',
        formFields: [
          { name: 'email', label: 'Email', type: 'email', value: editingItem?.email || '', required: true },
          { name: 'password', label: 'Password', type: 'password', value: '', required: !isEdit },
          {
            name: 'userType',
            label: 'Role',
            type: 'select',
            options: [
              { value: 'student', label: 'Student' },
              { value: 'instructor', label: 'Instructor' },
              { value: 'admin', label: 'Admin' }
            ],
            value: editingItem?.userType || ''
          }
        ]
      });
    } catch (error) {
      console.error('Error rendering users', error);
      req.flash('error', error.message);
      res.redirect('/dashboard');
    }
  }

  static async saveUser(req, res) {
    const isEdit = Boolean(req.params.id);
    try {
      const { email, password, userType } = req.body;
      const existingUser = isEdit && !password ? await userService.getUserById(req.params.id) : null;
      if (!isEdit && !password) {
        throw new Error('Password is required for new users.');
      }
      const passwordValue = password || existingUser?.passwordHash || '';
      const user = new User(
        isEdit ? req.params.id : 0,
        email,
        passwordValue,
        userType,
        moment().format('YYYY-MM-DD HH:mm:ss')
      );

      if (isEdit) {
        await userService.updateUser(user);
        req.flash('success', 'User updated.');
      } else {
        await userService.createUser(user);
        req.flash('success', 'User created.');
      }
    } catch (error) {
      console.error('Error saving user', error);
      req.flash('error', error.message);
      return res.redirect(isEdit ? `/users?edit=${req.params.id}` : '/users');
    }
    res.redirect('/users');
  }

  static async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      req.flash('success', 'User deleted.');
    } catch (error) {
      console.error('Error deleting user', error);
      req.flash('error', error.message);
    }
    res.redirect('/users');
  }

  // --- Students ---
  static async studentsPage(req, res) {
    try {
      const editId = req.query.edit;
      const [rawStudents, rawUsers] = await Promise.all([
        studentService.getAllStudents(),
        userService.getAllUsers()
      ]);
      const students = rawStudents || [];
      const users = rawUsers || [];
      const editingItem = editId ? await studentService.getStudentById(editId) : null;

      const rows = students.map((s) => ({
        id: s.studentId,
        name: `${s.stuFName} ${s.stuLName}`,
        userId: s.userId,
        dob: s.dob
      }));

      res.render('entities/manage', {
        layout: 'layouts/main',
        title: 'Students',
        user: req.session.user,
        active: 'students',
        currentPath: '/students',
        entity: 'student',
        rows,
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'userId', label: 'User ID' },
          { key: 'dob', label: 'DOB' }
        ],
        idKey: 'id',
        editId,
        formAction: editId ? `/students/${editId}?_method=PUT` : '/students',
        formMethod: editId ? 'PUT' : 'POST',
        formTitle: editId ? 'Edit student' : 'Create student',
        formFields: [
          {
            name: 'userId',
            label: 'User',
            type: 'select',
            options: users.filter((u) => u.userType === 'student').map((u) => ({ value: u.userId, label: `${u.email} (#${u.userId})` })),
            value: editingItem?.userId || ''
          },
          { name: 'stuFName', label: 'First name', type: 'text', value: editingItem?.stuFName || '', required: true },
          { name: 'stuLName', label: 'Last name', type: 'text', value: editingItem?.stuLName || '', required: true },
          { name: 'dob', label: 'Date of birth', type: 'date', value: editingItem?.dob ? moment(editingItem.dob).format('YYYY-MM-DD') : '' },
          { name: 'profilePicture', label: 'Profile picture URL', type: 'text', value: editingItem?.profilePicture || '' }
        ]
      });
    } catch (error) {
      console.error('Error rendering students', error);
      req.flash('error', error.message);
      res.redirect('/dashboard');
    }
  }

  static async saveStudent(req, res) {
    const isEdit = Boolean(req.params.id);
    try {
      const { userId, stuFName, stuLName, dob, profilePicture } = req.body;
      const student = new Student(
        isEdit ? req.params.id : 0,
        userId,
        stuFName,
        stuLName,
        dob,
        profilePicture
      );
      if (isEdit) {
        await studentService.updateStudent(student);
        req.flash('success', 'Student updated.');
      } else {
        await studentService.createStudent(student);
        req.flash('success', 'Student created.');
      }
    } catch (error) {
      console.error('Error saving student', error);
      req.flash('error', error.message);
      return res.redirect(isEdit ? `/students?edit=${req.params.id}` : '/students');
    }
    res.redirect('/students');
  }

  static async deleteStudent(req, res) {
    try {
      await studentService.deleteStudent(req.params.id);
      req.flash('success', 'Student deleted.');
    } catch (error) {
      console.error('Error deleting student', error);
      req.flash('error', error.message);
    }
    res.redirect('/students');
  }

  // --- Instructors ---
  static async instructorsPage(req, res) {
    try {
      const editId = req.query.edit;
      const [rawInstructors, rawUsers] = await Promise.all([
        instructorService.getInstructors(),
        userService.getAllUsers()
      ]);
      const instructors = rawInstructors || [];
      const users = rawUsers || [];
      const editingItem = editId ? await instructorService.getInstructorById(editId) : null;

      const rows = instructors.map((i) => ({
        id: i.instructorId,
        name: `${i.insFName} ${i.insLName}`,
        userId: i.userId,
        bio: i.bio
      }));

      res.render('entities/manage', {
        layout: 'layouts/main',
        title: 'Instructors',
        user: req.session.user,
        active: 'instructors',
        currentPath: '/instructors',
        entity: 'instructor',
        rows,
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'userId', label: 'User ID' },
          { key: 'bio', label: 'Bio' }
        ],
        idKey: 'id',
        editId,
        formAction: editId ? `/instructors/${editId}?_method=PUT` : '/instructors',
        formMethod: editId ? 'PUT' : 'POST',
        formTitle: editId ? 'Edit instructor' : 'Create instructor',
        formFields: [
          {
            name: 'userId',
            label: 'User',
            type: 'select',
            options: users.filter((u) => u.userType === 'instructor').map((u) => ({ value: u.userId, label: `${u.email} (#${u.userId})` })),
            value: editingItem?.userId || ''
          },
          { name: 'insFName', label: 'First name', type: 'text', value: editingItem?.insFName || '', required: true },
          { name: 'insLName', label: 'Last name', type: 'text', value: editingItem?.insLName || '', required: true },
          { name: 'bio', label: 'Bio', type: 'textarea', value: editingItem?.bio || '' },
          { name: 'profilePicture', label: 'Profile picture URL', type: 'text', value: editingItem?.profilePicture || '' }
        ]
      });
    } catch (error) {
      console.error('Error rendering instructors', error);
      req.flash('error', error.message);
      res.redirect('/dashboard');
    }
  }

  static async saveInstructor(req, res) {
    const isEdit = Boolean(req.params.id);
    try {
      const { userId, insFName, insLName, bio, profilePicture } = req.body;
      const instructor = new Instructor(
        isEdit ? req.params.id : 0,
        userId,
        insFName,
        insLName,
        bio,
        profilePicture
      );
      if (isEdit) {
        await instructorService.updateInstructor(instructor);
        req.flash('success', 'Instructor updated.');
      } else {
        await instructorService.createInstructor(instructor);
        req.flash('success', 'Instructor created.');
      }
    } catch (error) {
      console.error('Error saving instructor', error);
      req.flash('error', error.message);
      return res.redirect(isEdit ? `/instructors?edit=${req.params.id}` : '/instructors');
    }
    res.redirect('/instructors');
  }

  static async deleteInstructor(req, res) {
    try {
      await instructorService.deleteInstructor(req.params.id);
      req.flash('success', 'Instructor deleted.');
    } catch (error) {
      console.error('Error deleting instructor', error);
      req.flash('error', error.message);
    }
    res.redirect('/instructors');
  }

  // --- Quizzes (read/create minimal) ---
  static async quizzesPage(req, res) {
    try {
      const editId = req.query.edit;
      const [rawQuizzes, rawCourses] = await Promise.all([
        quizService.getAllQuizzes(),
        courseService.getAllCourses()
      ]);
      const quizzes = rawQuizzes || [];
      const courses = rawCourses || [];
      const editingItem = editId ? await quizService.getQuizById(editId) : null;

      const rows = quizzes.map((q) => ({
        id: q.quizId,
        title: q.quizName,
        courseId: q.courseId,
        description: q.quizDescription
      }));

      res.render('entities/manage', {
        layout: 'layouts/main',
        title: 'Quizzes',
        user: req.session.user,
        active: 'quizzes',
        currentPath: '/quizzes',
        entity: 'quiz',
        rows,
        columns: [
          { key: 'title', label: 'Title' },
          { key: 'courseId', label: 'Course ID' },
          { key: 'description', label: 'Description' }
        ],
        idKey: 'id',
        editId,
        formAction: editId ? `/quizzes/${editId}?_method=PUT` : '/quizzes',
        formMethod: editId ? 'PUT' : 'POST',
        formTitle: editId ? 'Edit quiz' : 'Create quiz',
        formFields: [
          { name: 'quizName', label: 'Quiz name', type: 'text', value: editingItem?.quizName || '', required: true },
          { name: 'quizDescription', label: 'Description', type: 'textarea', value: editingItem?.quizDescription || '' },
          {
            name: 'courseId',
            label: 'Course',
            type: 'select',
            options: courses.map((c) => ({ value: c.courseId, label: `${c.courseName} (#${c.courseId})` })),
            value: editingItem?.courseId || ''
          }
        ]
      });
    } catch (error) {
      console.error('Error rendering quizzes', error);
      req.flash('error', error.message);
      res.redirect('/dashboard');
    }
  }

  static async saveQuiz(req, res) {
    const isEdit = Boolean(req.params.id);
    try {
      const { courseId, quizName, quizDescription } = req.body;
      const quiz = new Quiz(
        isEdit ? req.params.id : 0,
        courseId,
        quizName,
        quizDescription,
        moment().format('YYYY-MM-DD')
      );
      if (isEdit) {
        await quizService.updateQuiz(quiz);
        req.flash('success', 'Quiz updated.');
      } else {
        await quizService.createQuiz(quiz);
        req.flash('success', 'Quiz created.');
      }
    } catch (error) {
      console.error('Error saving quiz', error);
      req.flash('error', error.message);
      return res.redirect(isEdit ? `/quizzes?edit=${req.params.id}` : '/quizzes');
    }
    res.redirect('/quizzes');
  }

  static async deleteQuiz(req, res) {
    try {
      await quizService.deleteQuiz(req.params.id);
      req.flash('success', 'Quiz deleted.');
    } catch (error) {
      console.error('Error deleting quiz', error);
      req.flash('error', error.message);
    }
    res.redirect('/quizzes');
  }

  // --- Enrollments ---
  static async enrollmentsPage(req, res) {
    try {
      const editId = req.query.edit;
      const [rawEnrollments, rawStudents, rawCourses] = await Promise.all([
        enrollementService.getAllEnrollements(),
        studentService.getAllStudents(),
        courseService.getAllCourses()
      ]);
      const enrollments = rawEnrollments || [];
      const students = rawStudents || [];
      const courses = rawCourses || [];
      const editingItem = editId ? await enrollementService.getEnrollementById(editId) : null;

      const rows = enrollments.map((e) => ({
        id: e.enrollementId,
        studentId: e.studentId,
        courseId: e.courseId,
        status: e.status
      }));

      res.render('entities/manage', {
        layout: 'layouts/main',
        title: 'Enrollments',
        user: req.session.user,
        active: 'enrollments',
        currentPath: '/enrollments',
        entity: 'enrollment',
        rows,
        columns: [
          { key: 'studentId', label: 'Student ID' },
          { key: 'courseId', label: 'Course ID' },
          { key: 'status', label: 'Status' }
        ],
        idKey: 'id',
        editId,
        formAction: editId ? `/enrollments/${editId}?_method=PUT` : '/enrollments',
        formMethod: editId ? 'PUT' : 'POST',
        formTitle: editId ? 'Edit enrollment' : 'Create enrollment',
        formFields: [
          {
            name: 'studentId',
            label: 'Student',
            type: 'select',
            options: students.map((s) => ({ value: s.studentId, label: `${s.stuFName} ${s.stuLName} (#${s.studentId})` })),
            value: editingItem?.studentId || ''
          },
          {
            name: 'courseId',
            label: 'Course',
            type: 'select',
            options: courses.map((c) => ({ value: c.courseId, label: `${c.courseName} (#${c.courseId})` })),
            value: editingItem?.courseId || ''
          },
          { name: 'status', label: 'Status', type: 'text', value: editingItem?.status || 'active' }
        ]
      });
    } catch (error) {
      console.error('Error rendering enrollments', error);
      req.flash('error', error.message);
      res.redirect('/dashboard');
    }
  }

  static async saveEnrollment(req, res) {
    const isEdit = Boolean(req.params.id);
    try {
      const { studentId, courseId, status } = req.body;
      const enrollement = new Enrollement(
        isEdit ? req.params.id : 0,
        studentId,
        courseId,
        status,
        moment().format('YYYY-MM-DD')
      );
      if (isEdit) {
        await enrollementService.updateEnrollement(enrollement);
        req.flash('success', 'Enrollment updated.');
      } else {
        await enrollementService.createEnrollement(enrollement);
        req.flash('success', 'Enrollment created.');
      }
    } catch (error) {
      console.error('Error saving enrollment', error);
      req.flash('error', error.message);
      return res.redirect(isEdit ? `/enrollments?edit=${req.params.id}` : '/enrollments');
    }
    res.redirect('/enrollments');
  }

  static async deleteEnrollment(req, res) {
    try {
      await enrollementService.deleteEnrollement(req.params.id);
      req.flash('success', 'Enrollment deleted.');
    } catch (error) {
      console.error('Error deleting enrollment', error);
      req.flash('error', error.message);
    }
    res.redirect('/enrollments');
  }

  // --- Materials (read + create) ---
  static async materialsPage(req, res) {
    try {
      const editId = req.query.edit;
      const [rawMaterials, rawCourses] = await Promise.all([
        courseMaterialService.getAllCourseMaterials(),
        courseService.getAllCourses()
      ]);
      const materials = rawMaterials || [];
      const courses = rawCourses || [];
      const editingItem = editId ? await courseMaterialService.getCourseMaterialById(editId) : null;

      const rows = materials.map((m) => ({
        id: m.materialId,
        title: m.title,
        courseId: m.courseId,
        type: m.materialType
      }));

      res.render('entities/manage', {
        layout: 'layouts/main',
        title: 'Course Materials',
        user: req.session.user,
        active: 'materials',
        currentPath: '/materials',
        entity: 'material',
        rows,
        columns: [
          { key: 'title', label: 'Title' },
          { key: 'courseId', label: 'Course ID' },
          { key: 'type', label: 'Type' }
        ],
        idKey: 'id',
        editId,
        formAction: editId ? `/materials/${editId}?_method=PUT` : '/materials',
        formMethod: editId ? 'PUT' : 'POST',
        formTitle: editId ? 'Edit material' : 'Add material',
        formFields: [
          { name: 'title', label: 'Title', type: 'text', value: editingItem?.title || '', required: true },
          {
            name: 'courseId',
            label: 'Course',
            type: 'select',
            options: courses.map((c) => ({ value: c.courseId, label: `${c.courseName} (#${c.courseId})` })),
            value: editingItem?.courseId || ''
          },
          { name: 'materialType', label: 'Type', type: 'text', value: editingItem?.materialType || '' },
          { name: 'filePath', label: 'File path / URL', type: 'text', value: editingItem?.filePath || '' }
        ]
      });
    } catch (error) {
      console.error('Error rendering materials', error);
      req.flash('error', error.message);
      res.redirect('/dashboard');
    }
  }

  static async saveMaterial(req, res) {
    const isEdit = Boolean(req.params.id);
    try {
      const { courseId, title, materialType, filePath } = req.body;
      const material = new CourseMaterial(
        isEdit ? req.params.id : 0,
        courseId,
        title,
        materialType,
        filePath,
        moment().format('YYYY-MM-DD')
      );
      if (isEdit) {
        await courseMaterialService.updateCourseMaterial(material);
        req.flash('success', 'Material updated.');
      } else {
        await courseMaterialService.createCourseMaterial(material);
        req.flash('success', 'Material created.');
      }
    } catch (error) {
      console.error('Error saving material', error);
      req.flash('error', error.message);
      return res.redirect(isEdit ? `/materials?edit=${req.params.id}` : '/materials');
    }
    res.redirect('/materials');
  }

  static async deleteMaterial(req, res) {
    try {
      await courseMaterialService.deleteCourseMaterial(req.params.id);
      req.flash('success', 'Material deleted.');
    } catch (error) {
      console.error('Error deleting material', error);
      req.flash('error', error.message);
    }
    res.redirect('/materials');
  }
}

module.exports = ViewController;
