# Course Compass LMS — Product, UX, Engineering and Security Audit

Audit date: 20 June 2026  
Scope: learner app, admin app, Express API, Prisma schema, authentication, authorization, responsive implementation, accessibility semantics, build and test tooling.

## 1. Executive summary

The LMS has a strong visual foundation and a broad page surface, but it is not yet production-ready as a premium LMS. Both frontends build successfully and the learner product supports the essential browse → enroll → learn → progress → certificate journey. The admin portal has unusually broad navigation and polished presentation.

The main risk is the gap between visible admin capabilities and persisted backend capabilities. A number of admin screens, search results, notifications, settings and enterprise pages use browser `localStorage`, seeds or mock metrics. They look functional on one browser but are not durable, multi-user, auditable or safe for production. The database currently models users, courses, lessons, learning paths and enrollments only; it has no first-class assignments, quizzes, submissions, announcements, billing, audit logs, support tickets or notification records.

This pass fixed confirmed access-control, data-integrity, session, password-reset, CORS and React runtime risks. No destructive database change was made. Live database-backed end-to-end verification could not be completed because the configured external database connection did not become available within the execution environment; this is recorded as an explicit limitation rather than a pass.

Overall health: **6/10 — credible beta foundation, substantial production integration still required.**

## 2. Architecture and route inventory

### Learner/public application

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Marketing home and discovery |
| `/login` | Public | Learner sign-in |
| `/register` | Public | Learner registration |
| `/forgot-password` | Public | Reset request |
| `/reset-password/:id/:token` | Public | Password reset |
| `/courses` | Public | Catalog, search, filters and sort |
| `/courses/:id` | Public | Course detail and enrollment |
| `/features` | Public | Product features |
| `/support` | Public | Support request |
| `/learning-paths` | Public | Learning-path catalog |
| `/learning-paths/:id` | Public | Learning-path detail |
| `/dashboard` | Authenticated | Learner overview and enrolled courses |
| `/learn/:id` | Authenticated | Course player and lesson completion |
| `/profile` | Authenticated | Profile, avatar and password |
| `/notifications` | Authenticated | Learner notifications |
| `/settings` | Authenticated | Learner preferences |
| `/certificates` | Authenticated | Earned certificates |
| `/certificate/:courseId` | Authenticated | Certificate detail |
| `/courses/new` | Admin | Course creation |
| `/portal` | Admin | Course/curriculum management |
| `/portal/courses/:id` | Admin | Course and lesson editing |
| `*` | Public | Not-found state |

### Admin application

Canonical routes below are also exposed through shorter aliases such as `/students`, `/courses`, `/analytics` and `/reports`.

| Route | Purpose |
| --- | --- |
| `/`, `/admin-login` | Admin authentication |
| `/dashboard/admin` | KPI dashboard |
| `/dashboard/admin/students`, `/:studentId` | Learner management/detail |
| `/dashboard/admin/teachers`, `/:teacherId` | Teacher management/detail |
| `/dashboard/admin/courses`, `/:courseId`, `/:courseId/edit` | Course management/detail/edit |
| `/dashboard/admin/course-builder` | Course authoring |
| `/dashboard/admin/analytics` | Analytics |
| `/dashboard/admin/reviews` | Review moderation |
| `/dashboard/admin/notifications` | Notification center |
| `/dashboard/admin/settings` | Platform and account settings |
| `/dashboard/admin/system` | System overview |
| `/dashboard/admin/certificates` | Certificate approvals |
| `/dashboard/admin/assignments` | Assignment overview |
| `/dashboard/admin/assessments` | Assessment overview |
| `/dashboard/admin/billing` | Billing overview |
| `/dashboard/admin/audit-logs` | Audit log view |
| `/dashboard/admin/activity-logs` | Activity view |
| `/dashboard/admin/support-tickets` | Support queue |
| `/dashboard/admin/reports` | Reports and exports |
| `/dashboard/admin/profile` | Admin profile |

### Backend capability inventory

- Authentication: register, login, logout, current user, forgot password and reset password.
- Course management: catalog/detail, create/update/delete, lesson create/delete, AI lesson generation and learning paths.
- Enrollment: enroll/unenroll, learner enrollments, lesson completion, mentor selection and progress.
- Administration: stats, users, course approval/deletion and certificate approval.
- Profile: profile, password and avatar updates.
- Uploads: authenticated single-file upload.
- Missing persisted domains: assignments, quizzes, attempts, submissions, grading, announcements, notifications, bookmarks, reviews, billing, support tickets, audit logs and calendar/deadlines.

## 3. Admin journey audit

The admin navigation is comprehensive and responsive patterns are present in the layout/sidebar. Dashboard, course, teacher, learner, analytics, review, notification and settings views have thoughtful hierarchy, filtering and empty/loading components.

The principal UX problem is trust: the interface does not consistently distinguish persisted API data from browser-local demonstration data. Actions can appear successful while existing only in one browser. Premium administration requires all writes, filters, exports and activity history to be backed by server-side records with authorization and audit trails.

Course authoring is split between the standalone admin app and admin-only routes inside the learner app. This duplicates mental models and creates maintenance risk. Choose one canonical authoring experience and deep-link to it from the other app.

## 4. Learner journey audit

The learner journey includes the right beta essentials: discovery, catalog filtering, details, enrollment, continue-learning dashboard, player progress, profile and certificates. Protected routes retain the requested path during login and inaccessible role routes redirect safely.

Notifications, settings, support tickets and wishlisting are currently local to the browser. They should be account-scoped API resources. Certificates are derived from enrollment state rather than a durable credential record. Learning paths are readable but lack learner enrollment/progress state. There are no real assessments, deadlines, prerequisites or instructor feedback loops yet.

## 5. UI, UX and accessibility findings

- Visual design is coherent, with reusable tokens, dark/light support and responsive grids.
- Both apps have large route surfaces but inconsistent product vocabulary: learner, student, user, teacher, mentor and celebrity teacher overlap.
- The admin application duplicates canonical and alias routes, increasing QA surface and analytics fragmentation.
- Destructive curriculum actions have confirmation, but custom dialogs still need full focus trapping, Escape handling and focus restoration.
- Many inputs rely on nearby visual text rather than systematic `label`/`htmlFor` relationships.
- Full lint currently reports 51 learner errors and 122 admin errors. Most admin failures are unused imports and strict React 19 purity/effect rules; learner failures are primarily explicit `any` types. Confirmed hook-order runtime defects in course management were fixed.
- Both bundles are large: learner main JavaScript is about 560 kB minified and admin includes a 319 kB chart chunk. More route-level splitting and chart isolation are appropriate.
- Reduced-motion styles and consistent screen-reader live regions need a dedicated cross-site pass.

## 6. Prioritized findings

### F-01 — Cross-course lesson completion

- Page/API: `/learn/:id`; `PUT /api/enrollments/:courseId/lessons/:lessonId`
- Role: Learner
- Reproduce: enroll in course A, then submit a lesson ID belonging to course B.
- Expected: request rejected.
- Actual before fix: lesson could be connected to course A's enrollment.
- Root cause: enrollment was checked, but lesson ownership was not.
- Severity: **P1 data integrity/access control**.
- Resolution: validate that the lesson exists in the enrolled course before connecting it.
- Verification: backend syntax check passed; code-path inspection passed; live DB test unavailable.

### F-02 — Enrollment in unpublished courses

- Page/API: course enrollment endpoint.
- Role: Learner
- Reproduce: submit a known pending/rejected course ID directly.
- Expected: unpublished course behaves as not found.
- Actual before fix: enrollment was created for any existing course.
- Root cause: no status predicate in enrollment controller.
- Severity: **P1 access control**.
- Resolution: require `approved` status and return a non-enumerating 404.
- Verification: backend syntax and code-path inspection passed.

### F-03 — Suspended sessions remained authorized

- Page/API: every protected API.
- Role: All authenticated roles.
- Reproduce: suspend an account after it has received a JWT, then reuse that JWT.
- Expected: protected calls fail.
- Actual before fix: middleware checked only whether the user still existed.
- Root cause: status was absent from middleware selection/enforcement.
- Severity: **P1 security**.
- Resolution: protected middleware now requires `status === approved`.
- Verification: backend syntax and route inspection passed.

### F-04 — Admin route trusted browser role flag

- Page: all admin routes.
- Role: Admin/unauthenticated visitor.
- Reproduce: set `localStorage.role = admin` without a valid JWT.
- Expected: redirect to login.
- Actual before fix: admin shell rendered.
- Root cause: client guard checked only local storage.
- Severity: **P1 security/UX** (API was still server-protected).
- Resolution: guard now verifies the JWT with `/auth/me`, verifies the server role and clears invalid sessions.
- Verification: targeted lint and admin production build passed.

### F-05 — Admin logout retained authentication data

- Page: sidebar and profile menu logout.
- Role: Admin.
- Reproduce: logout and inspect storage.
- Expected: role, JWT and cached user removed.
- Actual before fix: only `role` was removed.
- Root cause: duplicated incomplete logout handlers.
- Severity: **P1 session privacy**.
- Resolution: both handlers clear all three session values.
- Verification: code inspection and admin build passed.

### F-06 — Reset token leaked in API response

- Page/API: forgot-password.
- Role: Public.
- Reproduce: request a reset for an existing email and inspect JSON.
- Expected: generic response only.
- Actual before fix: live reset URL was returned.
- Root cause: testing convenience shipped unconditionally.
- Severity: **P1 security**.
- Resolution: reset link is included only outside production; default learner URL corrected to port 3000.
- Verification: backend syntax passed.

### F-07 — Production CORS accepted every origin

- Page/API: entire API.
- Role: All.
- Reproduce: send a browser request from an unlisted production origin.
- Expected: origin rejected.
- Actual before fix: callback allowed it.
- Root cause: development fallback was unconditional.
- Severity: **P1 security configuration**.
- Resolution: permissive fallback is limited to non-production environments.
- Verification: backend syntax passed.

### F-08 — Course-management hook-order violations

- Page: `/portal`, `/portal/courses/:id`.
- Role: Admin.
- Reproduce: transition between an authorized and redirected/loading render.
- Expected: stable render.
- Actual before fix: hooks appeared after conditional returns, violating React rules and risking runtime crashes.
- Root cause: guard/not-found redirects were placed before callbacks, effects and state hooks.
- Severity: **P1 reliability**.
- Resolution: hooks now execute unconditionally; loader is memoized; targeted lint is clean.
- Verification: targeted ESLint and learner build passed.

### F-09 — Pending course detail inaccessible to its manager

- Page/API: course manager and `GET /courses/:id`.
- Role: Admin.
- Reproduce: open a non-approved course through the management page.
- Expected: authenticated admin can inspect it.
- Actual before fix: public route never attached `req.user`, so controller treated admin as anonymous.
- Root cause: controller had owner/admin logic without optional authentication middleware.
- Severity: **P1 administration flow**.
- Resolution: safe optional bearer authentication added to the public detail route.
- Verification: backend syntax and route inspection passed.

### F-10 — Admin domain data is browser-local/mock-backed

- Pages: students, teachers, courses, global search, settings and several enterprise pages.
- Role: Admin.
- Reproduce: modify data in one browser and open another browser/device.
- Expected: shared persisted data with auditability.
- Actual: multiple features read/write local storage or seeded arrays.
- Root cause: UI surface outpaced API/schema implementation.
- Severity: **P1 product integrity**.
- Recommendation: migrate one domain at a time to authenticated APIs; label or hide incomplete modules until persisted.
- Verification: confirmed by repository-wide data-source inspection; not changed because it requires schema/product migration.

### F-11 — Automated quality gates are not healthy

- Area: CI/tooling.
- Role: Engineering.
- Reproduce: run both full lint tasks and learner tests.
- Expected: deterministic green checks.
- Actual: 51 learner lint errors, 122 admin lint errors; Vitest did not complete in this environment and initially failed config loading under the sandbox.
- Root cause: accumulated strict-lint debt and fragile test-runner/environment interaction.
- Severity: **P2 maintainability**.
- Recommendation: establish a zero-new-errors baseline, then burn down by domain; add API integration and critical Playwright flows.
- Verification: command output captured during this audit.

### F-12 — Premium learning domains are presentation-only or absent

- Pages: assessments, assignments, notifications, reports, certificates and support.
- Role: Admin and learner.
- Reproduce: inspect Prisma schema/API routes and compare with visible pages.
- Expected: durable records and end-to-end workflows.
- Actual: no corresponding database models/APIs for many visible modules.
- Root cause: incomplete vertical slices.
- Severity: **P2 product gap**.
- Recommendation: implement assessment/submission/grading first, then notification/deadline infrastructure, then reporting/audit.
- Verification: schema, controller and route inventory.

## 7. Security and permission assessment

Positive controls include password hashing, JWT verification, backend role authorization, rate limiting, Helmet, validation middleware, non-enumerating forgot-password messaging and upload middleware. The fixes in F-01 through F-07 close the highest-confidence issues found in this pass.

Remaining work:

- Prefer short-lived access tokens plus rotating httpOnly refresh cookies over long-lived local-storage JWTs.
- Add token revocation/session records so logout and account compromise can invalidate issued tokens.
- Add upload MIME signature validation, antivirus scanning, per-role size limits and private-object authorization.
- Validate and allowlist pagination sort fields and cap limits.
- Add CSRF protection if cookie authentication is introduced.
- Add structured audit events for admin writes.
- Remove unused placeholder Firebase configuration or fully integrate one identity provider; do not present disconnected Google sign-in as active.

## 8. Performance assessment

- Public course cache is useful but invalidation depends on exact cache keys and should be covered by tests.
- Learner main bundle exceeds the build warning threshold; lazy-load page modules and heavy certificate/editor features.
- Admin charts are split but still heavy; load analytics libraries only on analytics routes.
- Paginate server-side admin tables instead of persisting/processing full browser-local arrays.
- Add image sizing, lazy loading and CDN transforms for course thumbnails/avatars.
- Add database indexes after query telemetry, likely on course status/category/createdAt and enrollment user/status.

## 9. Premium LMS gap roadmap

### Phase 1 — trustworthy core (2–4 weeks)

- Replace local admin course/user/teacher writes with APIs.
- Consolidate course authoring into one application.
- Add Playwright journeys for login, enroll, resume, complete and admin publish.
- Resolve lint debt and add CI gates.
- Add session revocation and audit events.

### Phase 2 — learning outcomes (4–7 weeks)

- Add Assessment, Question, Attempt, Assignment, Submission, Rubric and Grade models.
- Add deadlines/calendar and learner reminders.
- Add prerequisite and learning-path enrollment/progress rules.
- Make certificates durable, verifiable credentials with revocation.

### Phase 3 — engagement and operations (4–6 weeks)

- Persist notifications/announcements and user read state.
- Add instructor feedback, discussions and learner support history.
- Build truthful event-based analytics, cohort retention and exports.
- Add bulk admin actions with preview, confirmation, partial-failure reporting and audit trails.

## 10. Changes implemented in this audit

- Enforced active-account status on every protected API.
- Added safe optional authentication for public course detail.
- Blocked unpublished-course enrollment.
- Blocked cross-course lesson completion.
- Restricted production CORS to configured origins.
- Removed production password-reset-link disclosure.
- Verified admin JWT/role before rendering protected admin routes.
- Cleared the complete admin session on logout.
- Removed displayed admin test credentials, fixed the admin back/forgot-password destinations, preserved server login errors and added submitting/accessible error states.
- Corrected admin-only frontend route declarations to match actual backend policy.
- Fixed React hook-order defects and types in course-management pages.

## 11. Files changed by this audit

- `backend/src/app.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/enrollment.controller.js`
- `backend/src/middlewares/auth.middleware.js`
- `backend/src/routes/v1/courses.routes.js`
- `course-compass-main/src/routes/AppRouter.tsx`
- `course-compass-main/src/pages/Portal/InstructorPortal.tsx`
- `course-compass-main/src/pages/Portal/ManageCourse.tsx`
- `admin/src/routes/AdminRoute.jsx`
- `admin/src/pages/Auth/AdminLogin.jsx`
- `admin/src/components/ui/AdminSidebar.jsx`
- `admin/src/components/ui/navbar/ProfileDropdown.jsx`

The repository already contained substantial uncommitted changes before this audit. They were preserved and are not claimed as audit changes.

## 12. Verification results

| Check | Result |
| --- | --- |
| Learner production build | Pass |
| Admin production build | Pass |
| Backend modified-file syntax | Pass |
| Targeted learner lint for modified portal/guard files | Pass |
| Targeted admin lint for modified login/guard files | Pass |
| Full learner lint | Fail: 51 errors, 11 warnings (pre-existing broader debt) |
| Full admin lint | Fail: 122 errors, 1 warning (pre-existing broader debt) |
| Learner Vitest | Not verified: config access failed in sandbox; escalated rerun did not complete |
| Live backend/database smoke | Not verified: configured external DB connection did not become ready before timeout |
| Browser E2E/responsive screenshots | Not run: no browser automation dependency is installed |

## 13. Remaining risks and limitations

- Live admin and learner flows must be repeated against a reachable test database before release.
- Mock/local-storage modules must not be marketed as production features.
- No automated backend test suite currently exists.
- No end-to-end browser suite currently exists.
- Full WCAG 2.2 AA conformance needs keyboard and screen-reader testing in real browsers.
- Course/lesson operations currently advertise instructor authorization at the router layer while controllers enforce admin-only behavior. This audit aligned visible learner-app routes to admin-only, but a product decision is still needed: implement true instructor ownership or remove instructor permissions from backend route declarations.
- Database migrations are required for assessments, submissions, notifications, audit events and durable certificates.

## 14. Release recommendation

Do not release as a premium production LMS yet. A controlled beta is reasonable after the external database smoke test, both critical role journeys, upload validation and the modified security cases are covered by automated integration tests. The next engineering milestone should be a trustworthy persisted core, not additional presentation-only pages.
