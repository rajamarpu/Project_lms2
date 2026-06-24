import API, { getApiErrorMessage } from '../api/client';

/**
 * Maps a backend User record (role=user) into the shape the existing
 * StudentTable / StudentProfileDrawer / StudentAnalyticsCards components
 * expect. Keeps the UI components untouched while wiring real data.
 */
export function mapUserToStudent(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
    enrolledCourse: user.enrollments?.[0]?.course?.title || '—',
    mentorName: user.enrollments?.[0]?.course?.celebrityTeacher || '—',
    progress: user.enrollments?.[0]?.progress ?? 0,
    status:
      user.status === 'approved'
        ? 'Active'
        : user.status === 'pending'
        ? 'Pending'
        : user.status === 'suspended'
        ? 'Suspended'
        : 'Completed',
    joinedDate: user.createdAt ? user.createdAt.split('T')[0] : '',
    badge: (user.enrollments?.[0]?.progress ?? 0) >= 80 ? 'Top Learner' : 'Quiz Master',
    phone: user.phone || '—',
    plan: 'Standard Plan',
    xp: (user.enrollments?.length || 0) * 500,
    lastActive: 'Recently',
    certificates: user.enrollments?.filter((e) => e.certificateApproved).length || 0,
    streak: 0,
    _raw: user,
  };
}

/**
 * Fetches all students (role=user) from the backend admin API.
 * Backend route: GET /api/admin/users?role=user
 */
export async function fetchStudents({ search = '', status = '', page = 1, limit = 100 } = {}) {
  try {
    const params = { role: 'user', page, limit };
    if (search) params.search = search;
    if (status) params.status = status === 'Active' ? 'approved' : status.toLowerCase();

    const res = await API.get('/admin/users', { params });
    const users = res.data.data || [];
    return { data: users.map(mapUserToStudent), meta: res.data.meta };
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not load students.'));
  }
}

export async function updateStudentStatus(id, status) {
  try {
    const backendStatus =
      status === 'Active' ? 'approved' : status === 'Pending' ? 'pending' : status.toLowerCase();
    const res = await API.put(`/admin/users/${id}`, { status: backendStatus });
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not update student.'));
  }
}

export async function deleteStudent(id) {
  try {
    await API.delete(`/admin/users/${id}`);
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not delete student.'));
  }
}
