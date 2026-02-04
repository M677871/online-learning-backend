const express = require("express");
const path = require("path");
const ejs = require("ejs");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT;
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

// Import controllers and their middleware (if needed for direct app.use)
const { InstructorController, requireInstructorLogin } = require("./controllers/instructorController");

// Import Route Modules
const authRoutes = require("./routes/authRoutes");
const userRoutes = require('./routes/userRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const courseMaterialRoutes = require('./routes/courseMaterialRoutes'); // This will handle /api/courses/:courseId/materials
const categoryRoutes = require('./routes/categoryRoutes');
const enrollementRoutes = require('./routes/enrollementRoutes');
const quizRoutes = require('./routes/quizRoutes');
const answerRoutes = require('./routes/quizAnswerRoutes');
const questionRoutes = require('./routes/quizQuestionRoutes');
const resultRoutes = require('./routes/quizResultRoutes');
const viewRoutes = require('./routes/viewRoutes');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', false); // disable global default; enable per-render when needed

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session Middleware (MUST be before flash and custom locals middleware)
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_your_session', //
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    console.log(`[GLOBAL MIDDLEWARE] Request URL: ${req.url}, Method: ${req.method}, User in session: ${req.session.user ? req.session.user.email : 'None'}`);
    next();
});

// --- ROUTE MOUNTING ---
// Order matters: more specific routes first, then general API routes, then catch-all.

// Instructor-specific dashboard and forms
app.use('/instructor', instructorRoutes);

// Student-specific dashboard
app.use('/student', studentRoutes);

// New UI routes (dashboards + entity pages)
app.use('/', viewRoutes);

// Authentication routes (login, signup, logout)
app.use('/', authRoutes);

// API Routes (prefixed with /api)
app.use('/api/users', userRoutes);
app.use('/api/course', courseRoutes); // General course API (e.g., /api/course/view-courses, /api/course/:id)
app.use('/api/quiz', quizRoutes);
app.use('/api/enrollement', enrollementRoutes);
app.use('/api/material', courseMaterialRoutes); // This will handle /api/material/courses/:courseId/materials if defined that way
app.use('/api', courseMaterialRoutes); // <--- IMPORTANT: Mount courseMaterialRoutes here to get /api/courses/:courseId/materials
                                      //      If your courseMaterialRoutes.js defines routes like /courses/:courseId/materials
                                      //      then mounting it here makes them available at /api/courses/:courseId/materials.
                                      //      This is the common pattern for nested resources.

app.use('/api/answer', answerRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/result', resultRoutes);


// Other General Frontend Routes (render EJS views that are not part of dashboards)
// Keep these only if they are for standalone pages not covered by specific route files.
app.get('/quiz', (req, res) => {
    console.log('[GET /quiz] Rendering createQuizz.ejs');
    try { res.render('createQuizz.ejs', { user: req.session.user }); } catch (error) { console.error('Error rendering createQuizz:', error); res.status(500).send('Internal Server Error'); }
});
app.get('/question', (req, res) => {
    console.log('[GET /question] Rendering createQuizQuestion.ejs');
    try { res.render('createQuizQuestion.ejs', { user: req.session.user }); } catch (error) { console.error('Error rendering createQuizQuestion:', error); res.status(500).send('Internal Server Error'); }
});
app.get('/answer', (req, res) => {
    console.log('[GET /answer] Rendering createQuizAnswer.ejs');
    try { res.render('createQuizAnswer.ejs', { user: req.session.user }); } catch (error) { console.error('Error in answer:', error); res.status(500).send('Internal Server Error'); }
});
app.get('/enrollement', (req, res) => {
    console.log('[GET /enrollement] Rendering createEnrollement.ejs');
    try { res.render('createEnrollement.ejs', { user: req.session.user }); } catch (error) { console.error('Error in enrollement:', error); res.status(500).send('Internal Server Error'); }
});
app.get('/changePassword', (req, res) => {
    console.log('[GET /changePassword] Rendering changePassword.ejs');
    try { res.render('changePassword.ejs', { user: req.session.user }); } catch (error) { console.error('Error changing pass:', error); res.status(500).send('Internal Server Error'); }
});
app.get('/editUser', (req, res) => {
    console.log('[GET /editUser] Rendering editUsers.ejs');
    try { res.render('editUsers.ejs', { user: req.session.user, errorMessage: null }); } catch (error) { console.error('Error in edit user:', error); res.status(500).send('Internal Server Error'); }
});


// Catch-all Home Page (Lowest priority for frontend routes)
app.get('/', async (req, res) => {
    console.log('[GET /] Redirecting to /dashboard');
    return res.redirect('/dashboard');
});

// Global Error Handling Middleware (always last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
