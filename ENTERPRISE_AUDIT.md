# LMS Enterprise Transformation — Preservation Audit

This document is the pre-transformation baseline. UI modernization must preserve every implemented route, permission, API call, persisted workflow, and role boundary listed here. The transformation is frontend-only unless a later change is explicitly authorized.

## Application topology

- Learner/instructor application: React 18, TypeScript, Vite, Tailwind, Radix/shadcn, React Query, Axios, React Router.
- Admin application: React 19, Vite, Tailwind, React Router, Recharts, Framer Motion.
- API: Express, Prisma/PostgreSQL, JWT access and refresh sessions, Redis integration, BullMQ email infrastructure, Multer uploads.
- Canonical local ports: learner `3000`, admin `3001`, API `5001`.
- API compatibility: both `/api/*` and `/api/v1/*` aliases are mounted.

## Roles and permissions

- Learner (`user`): catalog browsing, enrollment, playback/progress, coursework, certificates, preferences, notifications, community, AI tutors, practice, support, reviews, bookmarks.
- Instructor (`instructor`): protected instructor portal access and live-session creation. Existing course mutation endpoints remain admin-authorized.
- Admin (`admin`): full protected admin portal, people/course lifecycle, content operations, grading, certificates, communication, moderation, analytics, billing records, support, and audit logs.

## Authentication inventory

Implemented:

- Registration with validation and password policy.
- Login with JWT access token and persisted refresh-token session.
- Current-user session validation (`/auth/me`).
- Token refresh.
- Logout current session and logout all sessions.
- Forgot-password request and tokenized password reset.
- Role-aware protected routes and account approval/status enforcement.
- Password update through profile API.

Not currently implemented and therefore not claimed:

- OTP verification.
- Email verification workflow.
- OAuth/social sign-in.

## Learner/instructor route inventory

Public routes:

- `/` — marketing/home and catalog discovery.
- `/login`, `/register`, `/forgot-password`, `/reset-password/:id/:token` — authentication.
- `/courses`, `/courses/:id` — catalog and course detail.
- `/features`, `/support` — platform capabilities and support.
- `/learning-paths`, `/learning-paths/:id` — path discovery/detail.
- `/verify/:verificationId` — public certificate verification.

Authenticated routes:

- `/dashboard` — learner learning summary.
- `/learn/:id` — course player with lesson progress and resume state.
- `/courses/:courseId/work` — assessments and assignments.
- `/profile`, `/settings`, `/notifications` — identity, preferences, notification center.
- `/certificates`, `/certificate/:courseId` — certificate list and printable certificate.
- `/community`, `/community/:topicId` — topics, posts, reporting.
- `/live-sessions` — scheduled sessions and meeting links.
- `/ai-tutors` — persisted AI personality chat rooms.
- `/questions` — practice-question validation.

Instructor/admin routes in the learner application:

- `/portal` — instructor course/statistics portal.
- `/courses/new` — course creation UI.
- `/portal/courses/:id` — course details, lessons, AI syllabus, lifecycle controls.

## Admin route inventory

- `/`, `/admin-login` — administrator authentication.
- `/dashboard/admin` — live operational dashboard.
- `/dashboard/admin/students`, `/students` — learner directory and creation.
- `/dashboard/admin/students/:studentId`, `/students/:studentId` — learner profile destination.
- `/dashboard/admin/teachers`, `/teachers` — instructor directory and creation.
- `/dashboard/admin/teachers/:teacherId`, `/teachers/:teacherId` — instructor profile destination.
- `/dashboard/admin/courses`, `/courses` — course operations.
- `/dashboard/admin/courses/:courseId/edit`, `/courses/:courseId/edit` — course workspace.
- `/dashboard/admin/course-builder`, `/course-builder` — course creation destination.
- `/dashboard/admin/analytics`, `/analytics` — live analytics overview.
- `/dashboard/admin/analytics/:metricKey`, `/analytics/:metricKey` — metric detail pages.
- `/dashboard/admin/feature-hub`, `/feature-hub` — AI tutor, sessions, practice, community moderation.
- Assessments, assignments, certificates, reviews, notifications, billing, reports, support tickets, audit logs, activity logs, settings, profile aliases under both `/dashboard/admin/*` and short routes.
- Legacy `/dashboard`, `/system-settings`, and `/dashboard/admin/system` redirects are preserved.

## Learner workflows

- Search/filter/sort course catalog and open course details.
- Enroll/unenroll, choose mentor, resume last lesson, complete lessons, persist progress.
- View curriculum, outcomes, instructor information, and published reviews.
- Submit/update course review and toggle bookmark/favorite.
- Submit assessments and assignments; view persisted score and instructor feedback.
- View, print/download, and publicly verify issued certificates.
- View and mark notifications read; follow action URLs.
- Update profile, upload avatar, change password, and persist preferences.
- Create community topics/posts, report content, join live sessions, use AI tutor chat, practice questions, and raise support tickets.

## Instructor workflows

- View instructor portal statistics and managed courses.
- Create and edit courses, lessons, thumbnails, and course metadata where existing authorization permits.
- Generate syllabus content through the configured AI endpoint.
- Schedule live sessions.

## Admin workflows

- Create learner/instructor accounts with secure avatar upload; approve/suspend/delete accounts.
- Search platform records and deep-link into people/course destinations.
- Create, duplicate, publish, unpublish, schedule, reject, archive, restore, edit, and delete courses.
- Add/edit/delete/reorder lessons; create assessments and assignments.
- Review submissions and persist grades/feedback.
- Issue/revoke/reissue certificates.
- Send persisted in-app notifications and publish announcements.
- Moderate reviews and community reports.
- Configure AI tutor personalities, live sessions, and practice questions.
- View verified billing records, support tickets, audit/activity records, database-derived analytics, and metric detail pages.
- Persist admin appearance/profile/platform/billing/security/notification settings currently supported by the frontend settings state.

## API and persistence inventory

- Auth: register, login, refresh, logout, logout-all, me, forgot/reset password.
- Courses: catalog/detail, CRUD, duplicate, lesson CRUD/reorder, AI generation, instructor stats, learning paths.
- Enrollments: mine/detail/create/delete, mentor, resume position, lesson completion.
- Profile/uploads/users/admin: profile/password/avatar, validated uploads, user/course administration, certificate approval history.
- Platform: announcements, notifications, preferences, bookmarks, reviews, assessments, assignments, submissions/grading, certificates, support tickets/messages, admin communications, audit logs, analytics, operations, global search.
- Feature parity: personalities, live sessions, community/reporting, chat, practice questions, retake grants.
- Persistence models include users/sessions, courses/lessons/enrollments, learning paths, notifications/preferences/bookmarks, assessments/attempts/questions, assignments/submissions, certificates, billing, announcements, support tickets/messages, reviews, audit logs, live sessions, community, AI chat, and practice questions.

## Design/theme baseline

- Both applications already persist `light`, `dark`, and `system` theme choices.
- Learner tokens use navy/deep navy, cyan/teal primary, blue accents, purple secondary, and orange highlights.
- Admin tokens use navy/slate surfaces with blue, cyan, purple, green, orange, and red metric accents.
- Existing focus states, loading states, empty states, toast infrastructure, lazy admin routes, and responsive Tailwind utilities must remain operational.

## Known gaps to improve without backend/API/schema changes

- Harmonize semantic tokens and typography across learner/admin applications.
- Remove hardcoded low-contrast color usage and improve WCAG AA coverage.
- Improve home/dashboard information hierarchy and responsive composition.
- Improve catalog search suggestions and keyboard behavior using already-loaded course data.
- Improve cards, profile/settings, notification presentation, support hierarchy, and instructor/admin UX.
- Add frontend-derived streak, goal, calendar, roadmap, achievement, wishlist/favorite, recommendations, and analytics presentation where existing records support them.
- Payment capture, transactional email delivery, OTP, email verification, and provider-backed live chat require backend/provider work and are explicitly outside this frontend-only transformation.
