# CSIS-228 Online Learning Platform — REST API

Pure JSON REST API built with **Node.js**, **Express**, and **MariaDB** (native driver, no ORM).  
Authentication uses **JWT Bearer tokens**; authorization is role-based (`student` / `instructor`).

All layers use **static class methods**, **CommonJS modules**, and **native SQL queries** with parameterized placeholders.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create your .env from the example
cp .env.example .env          # then edit values

# 3. Import the database schema
mariadb -u root < database/schema.sql

# 4. Start the server
npm run dev   # nodemon (hot-reload)
npm start     # production
```

The API listens on `http://localhost:<PORT>` (default **3000**).

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `DB_HOST` | MariaDB host | `localhost` |
| `DB_USER` | MariaDB user | `root` |
| `DB_PASS` | MariaDB password | _(empty)_ |
| `DB_NAME` | Database name | `csis_228_project` |
| `DB_POOL_LIMIT` | Connection pool size | `5` |
| `JWT_SECRET` | Signing secret for tokens | _(required)_ |
| `JWT_EXPIRES_IN` | Token lifetime | `1h` |
| `JWT_ISSUER` | `iss` claim | `online-learning-api` |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor | `10` |

---

## Authentication

1. **Register** — `POST /api/users` (public)
2. **Login** — `POST /api/users/login` with `{ "email", "password" }`.  
   Returns `{ "success": true, "data": { "token": "<JWT>", "user": { ... } } }`.
3. **Use the token** — add header `Authorization: Bearer <JWT>` to every protected request.

---

## Project Structure

```
├── database/
│   └── schema.sql                  # MariaDB schema
├── package.json
├── src/
│   ├── app.js                      # Express app setup, routes & middleware
│   ├── server.js                   # HTTP server (app.listen)
│   ├── config/
│   │   ├── db.js                   # MariaDB connection pool
│   │   └── jwt.js                  # signAccessToken / verifyAccessToken
│   ├── controllers/                # Request → Response (try/catch, DTOs)
│   │   ├── UserController.js
│   │   ├── CategoryController.js
│   │   ├── CourseController.js
│   │   ├── CourseMaterialController.js
│   │   ├── EnrollmentController.js
│   │   ├── InstructorController.js
│   │   ├── StudentController.js
│   │   ├── QuizController.js
│   │   ├── QuizQuestionController.js
│   │   ├── QuizAnswerController.js
│   │   └── QuizResultController.js
│   ├── domain/
│   │   ├── dto/                    # Data Transfer Objects (static fromEntity)
│   │   │   ├── UserDTO.js
│   │   │   ├── CategoryDTO.js
│   │   │   ├── CourseDTO.js
│   │   │   └── ...
│   │   ├── entities/               # Domain entities (static fromRow)
│   │   │   ├── User.js
│   │   │   ├── Category.js
│   │   │   ├── Course.js
│   │   │   └── ...
│   │   └── repositories/           # Native SQL queries (pool.getConnection)
│   │       ├── UserRepository.js
│   │       ├── CategoryRepository.js
│   │       ├── CourseRepository.js
│   │       └── ...
│   ├── middlewares/
│   │   ├── ApiError.js             # Custom HTTP error class
│   │   ├── errorHandler.js         # Global JSON error handler
│   │   ├── notFound.js             # 404 handler
│   │   └── auth/
│   │       ├── authenticate.js     # JWT verification → req.user
│   │       └── authorize.js        # Role-based access control
│   ├── routes/                     # Express routers
│   │   ├── userRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── courseRoutes.js
│   │   └── ...
│   ├── services/                   # Business logic (static class methods)
│   │   ├── UserService.js
│   │   ├── CategoryService.js
│   │   ├── CourseService.js
│   │   └── ...
│   └── validators/                 # express-validator middleware arrays
│       ├── userValidators.js
│       ├── categoryValidators.js
│       ├── courseValidators.js
│       └── ...
```

### Architecture Flow

```
Request → Route → [Validators] → [authenticate] → [authorize] → Controller → Service → Repository → DB
                                                                     ↓              ↓            ↓
                                                                    DTO          Entity      Native SQL
```

---

## API Endpoints

Legend: 🔓 Public · 🔐 Authenticated · 🛡️ Instructor only

### Health

| Method | Path | Access |
|---|---|---|
| GET | `/api/health` | 🔓 |

### Users

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/users` | 🔓 | Register |
| POST | `/api/users/login` | 🔓 | Login → JWT |
| GET | `/api/users` | �️ | List all users |
| GET | `/api/users/:id` | 🔐 | Get user by ID |
| GET | `/api/users/email/:email` | 🔐 | Get user by email |
| PUT | `/api/users/changePassword` | 🔐 | Change password |
| PUT | `/api/users/:id` | 🛡️ | Update user |
| DELETE | `/api/users/:id` | 🛡️ | Delete user |

### Courses

| Method | Path | Access |
|---|---|---|
| GET | `/api/courses` | 🔓 |
| GET | `/api/courses/:id` | 🔓 |
| GET | `/api/courses/instructorByCourseId/:id` | 🔓 |
| GET | `/api/courses/stdOfCourse/:id` | 🔓 |
| POST | `/api/courses` | 🛡️ |
| PUT | `/api/courses/:id` | 🛡️ |
| DELETE | `/api/courses/:id` | 🛡️ |

### Categories

| Method | Path | Access |
|---|---|---|
| GET | `/api/categories` | 🔓 |
| GET | `/api/categories/:id` | 🔓 |
| GET | `/api/categories/courses/:id` | 🔓 |
| GET | `/api/categories/instructor/:id` | 🔓 |
| POST | `/api/categories` | 🛡️ |
| PUT | `/api/categories/:id` | 🛡️ |
| DELETE | `/api/categories/:id` | 🛡️ |

### Students

| Method | Path | Access |
|---|---|---|
| GET | `/api/students` | 🔐 |
| GET | `/api/students/:id` | 🔐 |
| GET | `/api/students/studentCourses/:id` | 🔐 |
| POST | `/api/students` | 🔐 |
| PUT | `/api/students/:id` | 🔐 |
| DELETE | `/api/students/:id` | 🛡️ |

### Instructors

| Method | Path | Access |
|---|---|---|
| GET | `/api/instructors` | 🔓 |
| GET | `/api/instructors/:id` | 🔓 |
| GET | `/api/instructors/courses/:id` | 🔓 |
| POST | `/api/instructors` | 🛡️ |
| PUT | `/api/instructors/:id` | 🛡️ |
| DELETE | `/api/instructors/:id` | 🛡️ |

### Enrollments

| Method | Path | Access |
|---|---|---|
| GET | `/api/enrollments` | 🔐 |
| GET | `/api/enrollments/:id` | 🔐 |
| POST | `/api/enrollments` | 🔐 |
| PUT | `/api/enrollments/:id` | 🔐 |
| DELETE | `/api/enrollments/:id` | 🔐 |

### Course Materials

| Method | Path | Access |
|---|---|---|
| GET | `/api/materials` | 🔓 |
| GET | `/api/materials/:id` | 🔓 |
| POST | `/api/materials` | 🛡️ |
| PUT | `/api/materials/:id` | 🛡️ |
| DELETE | `/api/materials/:id` | 🛡️ |

### Quizzes

| Method | Path | Access |
|---|---|---|
| GET | `/api/quizzes` | 🔓 |
| GET | `/api/quizzes/:id` | 🔓 |
| POST | `/api/quizzes` | 🛡️ |
| PUT | `/api/quizzes/:id` | 🛡️ |
| DELETE | `/api/quizzes/:id` | 🛡️ |

### Quiz Questions

| Method | Path | Access |
|---|---|---|
| GET | `/api/questions` | 🔓 |
| GET | `/api/questions/:id` | 🔓 |
| POST | `/api/questions` | 🛡️ |
| PUT | `/api/questions/:id` | 🛡️ |
| DELETE | `/api/questions/:id` | 🛡️ |

### Quiz Answers

| Method | Path | Access |
|---|---|---|
| GET | `/api/answers` | 🔓 |
| GET | `/api/answers/:id` | 🔓 |
| POST | `/api/answers` | 🔐 |
| PUT | `/api/answers/:id` | 🛡️ |
| DELETE | `/api/answers/:id` | 🛡️ |

### Quiz Results

| Method | Path | Access |
|---|---|---|
| GET | `/api/results` | 🔐 |
| GET | `/api/results/:id` | 🔐 |
| POST | `/api/results` | 🔐 |
| PUT | `/api/results/:id` | 🔐 |
| DELETE | `/api/results/:id` | 🔐 |

---

## Testing with Postman / cURL

```bash
# Register
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secret@123!","userType":"student"}'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secret@123!"}'
# → { "success": true, "data": { "token": "eyJ...", "user": { ... } } }

# Protected request (use token from login)
curl http://localhost:3000/api/enrollments \
  -H "Authorization: Bearer <paste-token-here>"
```

---

## Error Response Format

All errors return consistent JSON:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Validation errors (from express-validator):

```json
{
  "errors": [
    { "type": "field", "msg": "Email is required", "path": "email", "location": "body" }
  ]
}
```
