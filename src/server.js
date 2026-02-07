const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Route imports
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const studentRoutes = require('./routes/studentRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const courseMaterialRoutes = require('./routes/courseMaterialRoutes');
const quizRoutes = require('./routes/quizRoutes');
const quizQuestionRoutes = require('./routes/quizQuestionRoutes');
const quizAnswerRoutes = require('./routes/quizAnswerRoutes');
const quizResultRoutes = require('./routes/quizResultRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/materials', courseMaterialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', quizQuestionRoutes);
app.use('/api/answers', quizAnswerRoutes);
app.use('/api/results', quizResultRoutes);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
