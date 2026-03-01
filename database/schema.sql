-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.0-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for csis_228_project
CREATE DATABASE IF NOT EXISTS `csis_228_project` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `csis_228_project`;

-- Dumping structure for table csis_228_project.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.categories: ~1 rows (approximately)
INSERT INTO `categories` (`category_id`, `category_name`, `description`) VALUES
	(1, 'Science', 'Category for science subjects.');

-- Dumping structure for table csis_228_project.courses
CREATE TABLE IF NOT EXISTS `courses` (
  `course_id` int(11) NOT NULL AUTO_INCREMENT,
  `instructor_id` int(11) DEFAULT NULL,
  `categorie_id` int(11) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`course_id`),
  KEY `FK_courses_categories` (`categorie_id`),
  KEY `courses_ibfk_1` (`instructor_id`),
  CONSTRAINT `FK_courses_categories` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`instructor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.courses: ~3 rows (approximately)
INSERT INTO `courses` (`course_id`, `instructor_id`, `categorie_id`, `course_name`, `description`, `create_at`) VALUES
	(3, 2, 1, 'web developement', 'Nodejs backend ', '2025-03-10 22:00:00'),
	(5, 2, 1, 'DS', 'data structures with c++. ', '2025-03-11 07:18:46'),
	(10, 2, 1, 'Introduction to Programming', 'This course teaches the basics of programming.', '2025-03-21 22:00:00');

-- Dumping structure for table csis_228_project.course_materials
CREATE TABLE IF NOT EXISTS `course_materials` (
  `material_id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `material_type` enum('video','document','link','pdf') NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`material_id`),
  KEY `course_materials_ibfk_1` (`course_id`),
  CONSTRAINT `course_materials_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.course_materials: ~2 rows (approximately)
INSERT INTO `course_materials` (`material_id`, `course_id`, `title`, `material_type`, `file_path`, `created_at`) VALUES
	(1, 3, 'Backend nodejs', 'pdf', 'http://example.com/intro_to_programming.pdf', NULL),
	(3, 5, 'Introduction to Programming', 'pdf', 'http://materials/intro_to_programming.pdf', '2025-03-26 15:46:07');

-- Dumping structure for table csis_228_project.enrollments
CREATE TABLE IF NOT EXISTS `enrollments` (
  `enrollment_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `status` enum('enrolled','in_progress','completed') DEFAULT NULL,
  `enrolled_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`enrollment_id`),
  KEY `FK_enrollments_courses` (`course_id`),
  KEY `FK_enrollments_students` (`student_id`),
  CONSTRAINT `FK_enrollments_courses` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_enrollments_students` FOREIGN KEY (`student_id`) REFERENCES `students` (`studend_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.enrollments: ~2 rows (approximately)
INSERT INTO `enrollments` (`enrollment_id`, `student_id`, `course_id`, `status`, `enrolled_at`) VALUES
	(1, 5, 3, 'completed', '2025-03-22 14:23:10'),
	(8, 5, 5, 'completed', '2025-03-26 13:39:43');

-- Dumping structure for table csis_228_project.instructors
CREATE TABLE IF NOT EXISTS `instructors` (
  `instructor_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `ins_FName` varchar(50) NOT NULL DEFAULT 'unkown',
  `ins_LName` varchar(50) NOT NULL DEFAULT 'unkown',
  `bio` text DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`instructor_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `instructors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.instructors: ~1 rows (approximately)
INSERT INTO `instructors` (`instructor_id`, `user_id`, `ins_FName`, `ins_LName`, `bio`, `profile_picture`) VALUES
	(2, 2, 'John', 'Doe', 'Experienced instructor in CS and web developement', 'image_url_here');

-- Dumping structure for table csis_228_project.quizzes
CREATE TABLE IF NOT EXISTS `quizzes` (
  `quiz_id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) DEFAULT NULL,
  `quiz_name` varchar(255) DEFAULT NULL,
  `quiz_description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`quiz_id`),
  KEY `quizzes_ibfk_1` (`course_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.quizzes: ~2 rows (approximately)
INSERT INTO `quizzes` (`quiz_id`, `course_id`, `quiz_name`, `quiz_description`, `created_at`) VALUES
	(2, 5, 'DS', 'This quiz covers DS concepts', '2025-03-25 22:00:00'),
	(5, 10, 'Introduction to Programming Quiz', 'This quiz covers basic programming concepts.', '2025-03-25 22:00:00');

-- Dumping structure for table csis_228_project.quiz_answers
CREATE TABLE IF NOT EXISTS `quiz_answers` (
  `answer_id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) DEFAULT NULL,
  `answer_text` text DEFAULT NULL,
  `answer_type` enum('MCQ','short answer','true or false') DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`answer_id`),
  KEY `quiz_answers_ibfk_1` (`question_id`),
  CONSTRAINT `quiz_answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`question_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.quiz_answers: ~1 rows (approximately)
INSERT INTO `quiz_answers` (`answer_id`, `question_id`, `answer_text`, `answer_type`, `is_correct`) VALUES
	(4, 2, 'A Binary Search Tree (BST) is a data structure that maintains sorted data, allowing for efficient searching, insertion, and deletion operations.', 'short answer', 1);

-- Dumping structure for table csis_228_project.quiz_questions
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `question_id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) DEFAULT NULL,
  `question_text` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`question_id`),
  KEY `quiz_questions_ibfk_1` (`quiz_id`),
  CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.quiz_questions: ~1 rows (approximately)
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `created_at`) VALUES
	(2, 2, 'What is a BST', '2025-03-25 22:00:00');

-- Dumping structure for table csis_228_project.quiz_results
CREATE TABLE IF NOT EXISTS `quiz_results` (
  `result_id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`result_id`),
  KEY `FK_quiz_results_quizzes` (`quiz_id`),
  KEY `FK_quiz_results_students` (`student_id`),
  CONSTRAINT `FK_quiz_results_quizzes` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_quiz_results_students` FOREIGN KEY (`student_id`) REFERENCES `students` (`studend_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.quiz_results: ~1 rows (approximately)
INSERT INTO `quiz_results` (`result_id`, `quiz_id`, `student_id`, `score`, `completed_at`) VALUES
	(3, 2, 5, 85, '2025-03-25 22:00:00');

-- Dumping structure for table csis_228_project.students
CREATE TABLE IF NOT EXISTS `students` (
  `studend_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `stu_FName` varchar(50) DEFAULT NULL,
  `stu_LName` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`studend_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.students: ~2 rows (approximately)
INSERT INTO `students` (`studend_id`, `user_id`, `stu_FName`, `stu_LName`, `dob`, `profile_picture`) VALUES
	(5, 2, NULL, 'issa', '2005-06-10', 'https://example.com/profile.jpg'),
	(8, 7, NULL, 'issa', '2000-01-01', 'https://example.com/profile.jpg');

-- Dumping structure for table csis_228_project.users
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_type` enum('student','instructor') NOT NULL,
  `create_at` date DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table csis_228_project.users: ~6 rows (approximately)
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `user_type`, `create_at`) VALUES
	(2, 'miled11@gmail.com', '$2b$10$zkVI/GmaMGqddis4/jBWV.kY5ts7SYpZcSdx4KScKe22KfCl7j132', 'instructor', '2025-03-24'),
	(6, 'miled@gmail.com', '$2b$10$So0Zviq9nhTaj5lpm4J33OlR0nvlx3WmcbXHu81gq1R.X2fu7OKQm', 'student', '2025-03-11'),
	(7, 'miled123@gmail.com', '$2b$10$fIjsFZIH.U43AXeUOw6usutx5DFoh0vIF5e1JK4pXuzTwhOLL66l6', 'student', '2025-03-22'),
	(9, 'miled112@gmail.com', '$2b$10$sY7PWTb3zCUtnUDJvkZOye171BWF3oo0UjJW2sfAz0BcOqMpQR.3q', 'student', '2025-03-22'),
	(10, 'miledddd@gmail.com', '$2b$10$LdtakY3HIjzrjqttzOoFRuJAdFlpFcezv4Clfug4yuVWaXLtNP2l2', 'student', '2025-03-22'),
	(11, 'Email@example.com', '$2b$10$c1ab5SXxrf/OMRUIO1FPMevchBwUqUhdUU8ydTAVxYBAGgo5t6o2K', 'instructor', '2025-03-24');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
