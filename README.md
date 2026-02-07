# CSIS-228 Online Learning Platform — REST API

Pure JSON REST API built with **Node.js**, **Express**, and **MariaDB** (native driver).  
Authentication uses **JWT Bearer tokens**; authorization is role-based (`student` / `instructor`).

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create your .env from the example
cp .env.example .env          # then edit values

# 3. Import the database schema
mariadb -u root < csis-228-project.sql

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
| `DB_NAME` | Database name | `csis228` |
| `DB_POOL_LIMIT` | Connection pool size | `5` |
| `JWT_SECRET` | Signing secret for tokens | _(required)_ |
| `JWT_EXPIRES_IN` | Token lifetime | `24h` |
| `JWT_ISSUER` | `iss` claim | `csis228-api` |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor | `10` |

---

## Authentication

1. **Register** — `POST /api/users` (public)
2. **Login** — `POST /api/users/login` with `{ "email", "password" }`.  
   Returns `{ "token": "<JWT>" }`.
3. **Use the token** — add header `Authorization: Bearer <JWT>` to every protected request.

---

## Project Structure

```
src/
├── server.js                # Express app & route mounting
├── db/
│   └── pool.js              # MariaDB connection pool + helpers
├── middleware/
│   ├── errorHandler.js      # Global JSON error handler
│   ├── notFound.js          # 404 handler
│   └── auth/
│       ├── authenticate.js  # JWT verification → req.user
│       └── authorize.js     # Role-based access control
├── utils/
│   ├── ApiError.js          # Custom HTTP error class
│   ├── asyncHandler.js      # Async route wrapper
│   └── jwt.js               # signAccessToken / verifyAccessToken
├── validators/              # express-validator DTOs
├── routes/                  # Express routers
├── controllers/             # Request → Response (JSON only)
├── services/                # Business logic
└── repositories/            # SQL queries (parameterized)
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
| GET | `/api/users` | 🔐 | List all |
| GET | `/api/users/:id` | 🔐 | Get one |
| PUT | `/api/users/:id` | 🔐 | Update |
| DELETE | `/api/users/:id` | 🔐 | Delete |

### Courses

| Method | Path | Access |
|---|---|---|
| GET | `/api/courses` | 🔓 |
| GET | `/api/courses/:id` | 🔓 |
| POST | `/api/courses` | 🛡️ |
| PUT | `/api/courses/:id` | 🛡️ |
| DELETE | `/api/courses/:id` | 🛡️ |

### Categories

| Method | Path | Access |
|---|---|---|
| GET | `/api/categories` | 🔓 |
| GET | `/api/categories/:id` | 🔓 |
| POST | `/api/categories` | 🛡️ |
| PUT | `/api/categories/:id` | 🛡️ |
| DELETE | `/api/categories/:id` | 🛡️ |

### Students

| Method | Path | Access |
|---|---|---|
| GET | `/api/students` | 🔐 |
| GET | `/api/students/:id` | 🔐 |
| POST | `/api/students` | 🔐 |
| PUT | `/api/students/:id` | 🔐 |
| DELETE | `/api/students/:id` | 🛡️ |

### Instructors

| Method | Path | Access |
|---|---|---|
| GET | `/api/instructors` | 🔓 |
| GET | `/api/instructors/:id` | 🔓 |
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
  -d '{"email":"test@example.com","password":"Secret123","user_type":"student"}'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secret123"}'
# → { "success": true, "data": { "token": "eyJ..." } }

# Protected request
curl http://localhost:3000/api/courses \
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

Validation errors include a `details` array:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```
