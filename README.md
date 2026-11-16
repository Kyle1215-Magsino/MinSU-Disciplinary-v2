# MinSU Disciplinary System

A web-based disciplinary case management system for Mindoro State University - Bongabong Campus.

**Stack:** React + Vite (frontend) · Express + MySQL (backend) · JWT authentication

---

## Setup

### 1. MySQL Database

Create the database and run the schema:

```sql
CREATE DATABASE minsu_disciplinary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the schema file:

```bash
mysql -u root -p minsu_disciplinary < server/schema.sql
```

### 2. Backend (Express API)

```bash
cd server
cp .env.example .env
# Edit .env with your MySQL credentials and a JWT secret
npm install
npm start
```

The server runs on `http://localhost:3000`.

### 3. Frontend (React)

```bash
# From project root
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api (already set by default)
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

---

## Default Admin Account

After running the schema, create your first admin by registering on the app — the first user to register gets role `officer` by default. To promote to admin, run this SQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or use the `server/create-admin.js` utility if present.

---

## Project Structure

```
├── src/                   # React frontend
│   ├── lib/
│   │   ├── api.js         # All API calls (MySQL backend)
│   │   └── useAuth.js     # Auth hook using JWT
│   └── pages/             # App pages
└── server/                # Express backend
    ├── index.js           # API routes
    ├── db.js              # MySQL connection pool
    ├── schema.sql         # Database schema
    └── middleware/
        └── auth.js        # JWT middleware
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/register` | — | Register |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/users` | admin | List users |
| POST | `/api/users` | admin | Add user |
| PUT | `/api/users/:id/role` | admin | Update role |
| PUT | `/api/users/:id/archive` | admin | Archive user |
| PUT | `/api/users/:id/restore` | admin | Restore user |
| GET | `/api/students` | ✓ | List students |
| POST | `/api/students` | ✓ | Add student |
| PUT | `/api/students/:id` | ✓ | Update student |
| DELETE | `/api/students/:id` | ✓ | Delete student |
| GET | `/api/cases` | ✓ | List cases |
| POST | `/api/cases` | ✓ | Report incident |
| PUT | `/api/cases/:id/status` | ✓ | Update status |
| POST | `/api/cases/merge` | ✓ | Merge duplicates |
