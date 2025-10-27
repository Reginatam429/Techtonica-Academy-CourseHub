# 🏫 Techtonica Academy — CourseHub

![](public/logo.gif)

An application where **students** browse/enroll in courses and track grades, and **teachers/admins** manage courses, rosters, and grading. Built with **Node/Express + PostgreSQL** (backend) and **React + Vite** (frontend).

**Live app:** https://techtonica-academy-coursehub.netlify.app  
**Live API (Heroku):** https://techtonica-coursehub-api-1dcb105ae03b.herokuapp.com

---

## ✨ Features (MVP)

- 🔐 JWT auth (Student / Teacher / Admin) + role-based access (RBAC)
- 👩‍🎓 Student self-registration (auto email `first.last@coursehub.io`, unique `studentId`)
- 📚 Course CRUD with capacity + prerequisites
- 📝 Enroll/unenroll (capacity and prereq checks)
- 🏷️ Teacher grading (A+ … F) with grade history & **GPA calculation**
- 🔎 User/Course search (name, email, major, code)
- 🧪 Backend + Frontend tests

---

## 🛠 Tech Stack

### Backend

- **express** – HTTP server & routing  
- **pg** – PostgreSQL client  
- **bcrypt** – password hashing  
- **jsonwebtoken** – JWT auth  
- **cors** – CORS headers for frontend→API  
- **dotenv** – environment variables  
- **helmet** – secure HTTP headers  
- **morgan** – request logging  
- **jest + supertest** – backend tests

### Frontend

- **react + vite** – SPA & dev tooling  
- **react-router-dom** – routing  
- **vitest + @testing-library/react** – frontend tests

---

## ⚙️ Setup — Local

> The project uses **two repos**: backend API and frontend SPA.

### 1) Backend (API)

Repo: `Techtonica-Academy-CourseHub-Server`
https://github.com/Reginatam429/Techtonica-Academy-CourseHub-Server.git


### 2) Frontend (SPA)

Repo: `Techtonica-Academy-CourseHub`

```bash
git clone https://github.com/Reginatam429/Techtonica-Academy-CourseHub.git
cd Techtonica-Academy-CourseHub
npm install
```

Create `.env`:

```env
# For local dev, use Vite proxy to your local API if configured, else point directly:
VITE_API_URL=http://localhost:3000
```

Run:

```bash
npm run dev
# App: http://localhost:5173
```

---

## 🔐 Auth & RBAC Summary

- **Roles:** `STUDENT`, `TEACHER`, `ADMIN`
- **JWT** is returned by `/auth/login` or `/auth/register` (student self-sign up)
- Include token in requests:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Access rules (high level):**

- **Student:** enroll/unenroll, view own grades/GPA
- **Teacher:** manage *their* courses, view rosters, grade their students
- **Admin:** full user management (create/search/update/delete)

---

## 🧪 Tests


### Frontend (Vitest + RTL)

Run:

```bash
npx vitest
```

Included examples:

- **NavBar**
  - Renders “Dashboard” when logged in (mocked `useAuth`)
  - Renders “Login” when logged out

- **Login page**
  - Renders email/password inputs and calls `login()` on submit

---

## 🚀 Deployment

 Netlify

Add `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Set `VITE_API_URL` in Netlify Environment Variables to Heroku API URL.

---

## 🔮 Future Improvements

- Password reset (+ email)
- Course sections & scheduling
- Transcripts & export
- More robust validation & error UX
- Teacher/admin bulk-enroll endpoint
- More test coverage (prereq/capacity paths, dashboards)