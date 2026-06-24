import API, { getApiErrorMessage } from '../api/client';

/**
 * Maps a backend User record (role=instructor) into the shape the existing
 * TeacherGrid / TeacherProfileView / TeacherDrawer components expect.
 */
export function mapUserToTeacher(user) {
  const courseCount = user.courses?.length ?? 0;
  const totalStudents = user.courses?.reduce((sum, c) => sum + (c._count?.enrollments ?? 0), 0) ?? 0;
  const avgRating =
    courseCount > 0
      ? user.courses.reduce((sum, c) => sum + (c.rating ?? 4.5), 0) / courseCount
      : 4.5;

  return {
    id: user.id,
    name: user.name,
    style: user.courses?.[0]?.category || 'Educator',
    course: user.courses?.[0]?.title || '—',
    enabled: user.status === 'approved',
    students: totalStudents,
    rating: Number(avgRating.toFixed(1)),
    revenue: user.courses?.reduce((sum, c) => sum + (c.price ?? 0) * (c._count?.enrollments ?? 0), 0) ?? 0,
    courses: courseCount,
    email: user.email,
    phone: user.phone || '—',
    joinDate: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
      : '',
    bio: user.bio || '',
    photo: user.avatar || null,
    verified: user.status === 'approved',
    featured: totalStudents > 1000,
    topMentor: avgRating >= 4.8,
    _raw: user,
  };
}

/**
 * Fetches all instructors from the backend admin API.
 * Backend route: GET /api/admin/users?role=instructor
 */
export async function fetchTeachers({ search = '', page = 1, limit = 100 } = {}) {
  try {
    const params = { role: 'instructor', page, limit };
    if (search) params.search = search;

    const res = await API.get('/admin/users', { params });
    const users = res.data.data || [];
    return { data: users.map(mapUserToTeacher), meta: res.data.meta };
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not load teachers.'));
  }
}

export async function updateTeacherStatus(id, enabled) {
  try {
    const res = await API.put(`/admin/users/${id}`, { status: enabled ? 'approved' : 'suspended' });
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not update teacher.'));
  }
}

export async function deleteTeacher(id) {
  try {
    await API.delete(`/admin/users/${id}`);
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not delete teacher.'));
  }
}
