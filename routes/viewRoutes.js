const express = require('express');
const ViewController = require('../controllers/viewController');

const router = express.Router();

router.get('/dashboard', ViewController.dashboard);

router.get('/courses', ViewController.coursesPage);
router.post('/courses', ViewController.saveCourse);
router.put('/courses/:id', ViewController.saveCourse);
router.delete('/courses/:id', ViewController.deleteCourse);

router.get('/categories', ViewController.categoriesPage);
router.post('/categories', ViewController.saveCategory);
router.put('/categories/:id', ViewController.saveCategory);
router.delete('/categories/:id', ViewController.deleteCategory);

router.get('/users', ViewController.usersPage);
router.post('/users', ViewController.saveUser);
router.put('/users/:id', ViewController.saveUser);
router.delete('/users/:id', ViewController.deleteUser);

router.get('/students', ViewController.studentsPage);
router.post('/students', ViewController.saveStudent);
router.put('/students/:id', ViewController.saveStudent);
router.delete('/students/:id', ViewController.deleteStudent);

router.get('/instructors', ViewController.instructorsPage);
router.post('/instructors', ViewController.saveInstructor);
router.put('/instructors/:id', ViewController.saveInstructor);
router.delete('/instructors/:id', ViewController.deleteInstructor);

router.get('/quizzes', ViewController.quizzesPage);
router.post('/quizzes', ViewController.saveQuiz);
router.put('/quizzes/:id', ViewController.saveQuiz);
router.delete('/quizzes/:id', ViewController.deleteQuiz);

router.get('/enrollments', ViewController.enrollmentsPage);
router.post('/enrollments', ViewController.saveEnrollment);
router.put('/enrollments/:id', ViewController.saveEnrollment);
router.delete('/enrollments/:id', ViewController.deleteEnrollment);

router.get('/materials', ViewController.materialsPage);
router.post('/materials', ViewController.saveMaterial);
router.put('/materials/:id', ViewController.saveMaterial);
router.delete('/materials/:id', ViewController.deleteMaterial);

module.exports = router;
