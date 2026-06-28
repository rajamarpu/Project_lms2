# UptoSkills LMS - Admin Panel Integration Guide

## Architecture Overview

The project consists of three main applications:
- **Backend** (Node.js/Express): Port 5000 - REST API server
- **Admin Panel** (React): Port 3001 - Admin dashboard
- **Student App** (React): Port 3000 - Student/Instructor portal

## Authentication Flow

### Admin Authentication
1. User signs in at `/admin-login` with email/password or Google OAuth
2. Firebase handles authentication
3. `AdminLogin` component calls `AuthContext.login(userData, 'admin')`
4. Role and user data stored in localStorage and AuthContext
5. User redirected to `/dashboard/admin` if authenticated

### Authorization
- **AdminRoute** checks `isAuthenticated && role === 'admin'`
- Protected routes redirect unauthorized users to `/admin-login`
- Logout clears auth state and localStorage

## API Integration

### Base URL Configuration
Set `REACT_APP_API_URL` environment variable (defaults to `http://localhost:5000/api`)

### Available API Modules

#### Admin API (`admin.js`)
```javascript
import { adminApi } from '@/api';

// Get admin stats
const stats = await adminApi.getAdminStats();

// Get admin profile
const profile = await adminApi.getAdminProfile();

// Login (alternative to Firebase)
const result = await adminApi.adminLogin(email, password);
```

#### Users API (`users.js`)
```javascript
import { usersApi } from '@/api';

const users = await usersApi.getUsers({ role: 'student' });
const user = await usersApi.getUserById(userId);
await usersApi.createUser(userData);
await usersApi.updateUser(userId, updatedData);
await usersApi.deleteUser(userId);
await usersApi.toggleUserStatus(userId, 'blocked');
```

#### Courses API (`courses.js`)
```javascript
import { coursesApi } from '@/api';

const courses = await coursesApi.getCourses({ category: 'web-dev' });
const course = await coursesApi.getCourseById(courseId);
await coursesApi.createCourse(courseData);
await coursesApi.updateCourse(courseId, updatedData);
await coursesApi.deleteCourse(courseId);
const stats = await coursesApi.getCourseStats(courseId);
```

#### Students API (`students.js`)
```javascript
import { studentsApi } from '@/api';

const students = await studentsApi.getStudents();
const student = await studentsApi.getStudentById(studentId);
await studentsApi.createStudent(studentData);
await studentsApi.enrollStudent(studentId, courseId);
const progress = await studentsApi.getStudentProgress(studentId, courseId);
```

#### Teachers API (`teachers.js`)
```javascript
import { teachersApi } from '@/api';

const teachers = await teachersApi.getTeachers();
const teacher = await teachersApi.getTeacherById(teacherId);
await teachersApi.createTeacher(teacherData);
await teachersApi.inviteTeacher(email);
const analytics = await teachersApi.getTeacherAnalytics(teacherId);
```

#### Analytics API (`analytics.js`)
```javascript
import { analyticsApi } from '@/api';

const analytics = await analyticsApi.getPlatformAnalytics();
const revenue = await analyticsApi.getRevenueAnalytics({ period: 'monthly' });
const growth = await analyticsApi.getStudentGrowthAnalytics();
```

## Custom Hooks

### useApi Hook
```javascript
import { useApi } from '@/hooks/useApi';
import { studentsApi } from '@/api';

function StudentsList() {
  const { data: students, loading, error, refetch } = useApi(
    studentsApi.getStudents,
    [],
    true // autoFetch on mount
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {students.map(student => <StudentCard key={student.id} student={student} />)}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### useApiMutation Hook
```javascript
import { useApiMutation } from '@/hooks/useApi';
import { studentsApi } from '@/api';

function DeleteStudentButton({ studentId, onSuccess }) {
  const { execute: deleteStudent, loading, error } = useApiMutation(
    () => studentsApi.deleteStudent(studentId)
  );

  const handleDelete = async () => {
    try {
      await deleteStudent();
      onSuccess();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete'} {error && <span>{error}</span>}
    </button>
  );
}
```

## Admin Dashboard Features

### Dashboard
- Platform overview with KPIs
- Student growth trends
- Revenue metrics
- Recent activity feed
- Top performers

### Students Management
- View all students with detailed profiles
- Add new students
- Delete students
- Send notifications
- Track progress
- Export student data

### Courses Management
- View all courses
- Add/Edit/Delete courses
- Upload course thumbnails
- Track course performance
- View enrollments

### Teachers Management
- View all teachers
- Invite new teachers
- Track teacher performance
- Analytics per teacher
- Communications

### Users Management
- View all platform users
- Filter by role (student, teacher, admin)
- Block/Unblock users
- Manage permissions
- Export user data

### Analytics
- Platform-wide analytics
- Revenue trends
- Student growth charts
- Course performance
- Engagement metrics
- Cohort retention analysis
- Export reports

### Settings
- Admin profile settings
- Security preferences
- Notification preferences
- Appearance customization
- Platform settings
- Billing information

### Notifications
- System notifications
- User notifications
- Notification scheduling
- Notification history
- Archive management

## Backend Routes Expected

### Admin Routes
```
POST   /api/admin/login           - Admin login
POST   /api/admin/register        - Admin registration
GET    /api/admin/profile         - Get admin profile
PUT    /api/admin/profile         - Update admin profile
GET    /api/admin/stats           - Get platform stats
```

### User Routes
```
GET    /api/users                 - Get all users
GET    /api/users/search          - Search users
GET    /api/users/:id             - Get user by ID
POST   /api/users                 - Create user
PUT    /api/users/:id             - Update user
DELETE /api/users/:id             - Delete user
PUT    /api/users/:id/status      - Toggle user status
```

### Course Routes
```
GET    /api/courses               - Get all courses
GET    /api/courses/:id           - Get course by ID
POST   /api/courses               - Create course
PUT    /api/courses/:id           - Update course
DELETE /api/courses/:id           - Delete course
GET    /api/courses/:id/stats     - Get course stats
POST   /api/courses/:id/thumbnail - Upload thumbnail
```

### Student Routes
```
GET    /api/students              - Get all students
GET    /api/students/:id          - Get student by ID
POST   /api/students              - Create student
PUT    /api/students/:id          - Update student
DELETE /api/students/:id          - Delete student
POST   /api/enrollments           - Enroll student
GET    /api/students/:id/courses/:cId/progress - Student progress
```

### Teacher Routes
```
GET    /api/teachers              - Get all teachers
GET    /api/teachers/:id          - Get teacher by ID
POST   /api/teachers              - Create teacher
PUT    /api/teachers/:id          - Update teacher
DELETE /api/teachers/:id          - Delete teacher
POST   /api/teachers/invite       - Invite teacher
GET    /api/teachers/:id/analytics - Teacher analytics
```

### Analytics Routes
```
GET    /api/analytics             - Platform analytics
GET    /api/analytics/revenue     - Revenue analytics
GET    /api/analytics/student-growth - Student growth
GET    /api/analytics/engagement  - Engagement metrics
GET    /api/analytics/courses/:id - Course analytics
GET    /api/analytics/teachers/:id - Teacher analytics
GET    /api/analytics/export      - Export analytics report
```

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
FIREBASE_API_KEY=your_key
```

## Deployment Checklist

- [ ] Backend deployed and API endpoints working
- [ ] Firebase authentication configured
- [ ] Admin users added to approved list
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Admin panel tested in production
- [ ] API token refresh handling working
- [ ] Error handling and logging configured
- [ ] Analytics tracking enabled
- [ ] Backup and restore procedures documented

## Troubleshooting

### Admin page not loading after login
- Check AuthContext is properly initialized
- Verify localStorage is not being cleared
- Check browser console for errors
- Ensure role is set to 'admin' in localStorage

### API requests failing
- Verify backend is running on port 5000
- Check REACT_APP_API_URL environment variable
- Verify auth token is being sent in headers
- Check CORS configuration on backend

### Firebase authentication not working
- Verify Firebase config in `firebase-config.js`
- Check Firebase console for authentication enabled
- Ensure redirect URIs are configured correctly
- Check admin emails in default list

## Development

### Start all apps
```bash
npm run dev  # from root directory
```

### Start specific app
```bash
npm run dev:backend    # Start backend
npm run dev:frontend   # Start student app
npm run dev:admin      # Start admin app
```

## Next Steps

1. Implement backend API endpoints according to specifications
2. Add role-based access control (RBAC) for teacher role
3. Create teacher dashboard component
4. Add real-time notifications using WebSockets
5. Implement data export functionality
6. Add advanced analytics visualizations
7. Create audit logging system
8. Add two-factor authentication
