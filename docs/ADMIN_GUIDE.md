# Admin & Teacher Guide

## User Roles Overview

| Role | Description |
|---|---|
| **Student** | A registered student with a grade level and optional teacher assignment |
| **Guest** | Plays without an account; scores post to the guest leaderboard only |
| **Teacher** | Manages students in their class; cannot modify other teachers' students |
| **Admin** | Full system access — can manage all users and all classes |

---

## Logging In

All roles use the same login screen at the app root. Enter an email and password to authenticate. Students whose school uses the `@zenithacademy.org` domain will have it pre-filled.

A **Continue as Guest** button is available for users who do not have an account.

---

## Teacher Panel

Teachers access their panel from the main menu (the admin icon appears in the user info bar when logged in as a teacher or admin).

### What teachers can do

- **View their students** — See a list of every student assigned to them with grade level and last-seen stats.
- **Add a student** — Create a new student account and assign it to the teacher's class. The school email domain is pre-filled.
- **Edit a student** — Update display name, grade, or password.
- **Remove a student** — Delete a student account from the system.

### Adding a student

1. Open the Admin Panel from the main menu.
2. Click **Add Student**.
3. Fill in the student's display name, email, grade, and a temporary password.
4. Click **Save**. The student can log in immediately.

---

## Admin (Super Admin) Panel

The Super Admin role has all teacher capabilities plus:

- View and manage **all teachers** in the system.
- View and manage **all students** across all classes.
- Add or remove teacher accounts.
- Reassign students between teachers.

---

## Password Reset

Students can request a password reset from the login screen. A reset code is generated and stored in the database. The teacher or admin retrieves the code and provides it to the student, who can then set a new password.

---

## Leaderboard Management

Leaderboard entries are written automatically when a student or guest completes a competitive session and beats their personal best. Entries cannot currently be manually deleted from the UI — use the Turso dashboard for any manual data corrections.

---

## Guest Leaderboard

Guest scores are stored in the same `scores_<subject>` tables as student scores but are tagged with `user_role = 'guest'`. The leaderboard UI separates guest entries so they do not compete directly with registered students.
