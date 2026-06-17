# Developer Task Tracker

A full-stack task management app built as a learning project. Teams can create projects, add members, assign tasks, update task status, and leave comments.

---

## Tech Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Frontend | React 19, TypeScript, Vite, React Router v7 |
| Backend  | Node.js, Express 5, TypeScript              |
| Database | MySQL (via mysql2/promise)                  |
| Auth     | JWT (jsonwebtoken) + bcrypt                 |

---

## Project Structure

```
developer-task-tracker/
├── backend/
│   └── src/
│       ├── server.ts
│       ├── db/connection.ts
│       ├── middleware/authMiddleware.ts
│       ├── utils/authTypes.ts
│       ├── controllers/
│       │   ├── authControllers.ts
│       │   ├── projectControllers.ts
│       │   ├── taskControllers.ts
│       │   ├── commentControllers.ts
│       │   └── dashboardControllers.ts
│       └── routes/
│           ├── authRoutes.ts
│           ├── projectRoutes.ts
│           ├── taskRoutes.ts
│           ├── commentRoutes.ts
│           └── dashboardRoutes.ts
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── api/
│       │   ├── helpers.ts
│       │   ├── authApi.ts
│       │   ├── projectApi.ts
│       │   ├── taskApi.ts
│       │   ├── commentApi.ts
│       │   └── dashboardApi.ts
│       ├── types/index.ts
│       ├── components/
│       │   ├── ProtectedRoute.tsx
│       │   ├── Navbar.tsx
│       │   ├── ProjectCard.tsx
│       │   ├── TaskCard.tsx
│       │   └── CommentList.tsx
│       └── pages/
│           ├── LoginPage.tsx
│           ├── SignupPage.tsx
│           ├── DashboardPage.tsx
│           ├── ProjectsPage.tsx
│           └── ProjectDetailPage.tsx
└── seed.sql  (optional — see below)
```

---

## Backend Setup

### Required `.env` file

Create `backend/.env` with:

```
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=TaskTracker
JWT_SECRET_KEY=some_long_random_secret_string
```

> The database (`TaskTracker`) must already exist in MySQL Workbench with the correct schema. This app does **not** run migrations or create tables.

### Run the backend

```bash
cd backend
pnpm install      # first time only
pnpm dev          # starts the server with hot-reload via tsx watch
```

The server runs at **http://localhost:8000**.

---

## Frontend Setup

### Run the frontend

```bash
cd frontend
pnpm install      # first time only
pnpm dev          # starts Vite dev server
```

The frontend runs at **http://localhost:5173** (Vite default).

---

## API Route Summary

### Auth — `/api/auth`
| Method | Path      | Auth? | Description               |
|--------|-----------|-------|---------------------------|
| POST   | /signup   | No    | Create a new user account |
| POST   | /login    | No    | Log in and receive a JWT  |
| POST   | /me       | Yes   | Get current user info     |

### Projects — `/api/projects`
| Method | Path                       | Auth? | Description                          |
|--------|----------------------------|-------|--------------------------------------|
| POST   | /                          | Yes   | Create a project                     |
| GET    | /                          | Yes   | List all projects you belong to      |
| GET    | /:projectId                | Yes   | Get project details + member list    |
| POST   | /:projectId/members        | Yes   | Add a user by email (owners only)    |
| POST   | /:projectId/tasks          | Yes   | Create a task inside a project       |
| GET    | /:projectId/tasks          | Yes   | List all tasks in a project          |

### Tasks — `/api/tasks`
| Method | Path                       | Auth? | Description                          |
|--------|----------------------------|-------|--------------------------------------|
| PATCH  | /:taskId/status            | Yes   | Update task status                   |
| DELETE | /:taskId                   | Yes   | Delete a task                        |
| POST   | /:taskId/comments          | Yes   | Add a comment to a task              |
| GET    | /:taskId/comments          | Yes   | Get all comments on a task           |

### Dashboard — `/api/dashboard`
| Method | Path | Auth? | Description                                          |
|--------|------|-------|------------------------------------------------------|
| GET    | /    | Yes   | Your projects, assigned tasks, and recent comments   |

All protected routes require the header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Testing Steps

Follow these steps in order to exercise the full app:

1. **Sign up User 1** — use the Signup page or send `POST /api/auth/signup`
2. **Sign up User 2** — repeat with a different email
3. **Log in as User 1** — you receive a JWT token (stored automatically in localStorage)
4. **Create a project** — go to Projects → create a project
5. **Add User 2 as member** — open the project → enter User 2's email → click Add Member
6. **Create a task** — fill in the task title, optionally assign it to User 2, click Add Task
7. **Update task status** — change the dropdown on any task to "In Progress" or "Done"
8. **Add a comment** — click "Show Comments" on a task, type a comment, click Post
9. **Log out**, then **log in as User 2**
10. **View the dashboard** — User 2 should see the project and their assigned task
11. **Open the project** — User 2 can update task status and add comments too

---

## Important Notes

- **JWT tokens expire in 5 minutes.** If requests start failing with 401, simply log out and log in again.
- The `created_by` and `user_id` fields are always taken from the JWT on the server — they are never trusted from the request body.
- Only project **owners** can add new members to a project.
- A user can only access tasks and comments if they are a member of the project that task belongs to.

---

## Optional Seed Data

`seed.sql` contains sample users, a project, tasks, and a comment for quick testing.

> **Do not run this if you already have data.** It inserts rows with hardcoded IDs and may conflict with existing records.

```bash
mysql -u root -p TaskTracker < seed.sql
```

Seed credentials — both users have password `password123`:
- alice@example.com
- bob@example.com
