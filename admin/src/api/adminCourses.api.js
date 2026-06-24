import API, { getApiErrorMessage } from '../api/client';
import { normalizeCourse } from "../utils/courseUtils";

const GRADIENTS = [
  'from-blue-600 via-blue-500 to-cyan-400',
  'from-amber-500 via-orange-500 to-red-500',
  'from-emerald-500 via-teal-500 to-green-400',
  'from-purple-600 via-violet-500 to-pink-500',
  'from-rose-500 via-pink-500 to-fuchsia-500',
  'from-slate-600 via-slate-500 to-gray-400',
  'from-cyan-500 via-sky-500 to-blue-500',
  'from-indigo-600 via-purple-600 to-blue-500',
];

/**
 * Maps a backend Course record into the shape the existing
 * CourseGrid / CourseDrawer / CourseKpiRow components expect.
 */
export function mapApiCourseToAdminCourse(course, index = 0) {
  const mapped = {
    id: course.id,
    title: course.title,
    level: course.level || 'Beginner',
    xp: course.xp || '1000 XP',
    category: course.category || 'General',
    lessons: course.lessons?.length ?? 0,
    rating: course.rating ?? 4.5,
    students: course._count?.enrollments ?? 0,
    completion: course.completion ?? 75,
    hours: course.duration ? parseInt(course.duration, 10) || 0 : 0,
    active: course.status === 'approved',
    status: course.status,
    teacher: course.celebrityTeacher || course.instructor?.name || 'Unassigned',
    price: String(course.price ?? 0),
    revenue: (course.price ?? 0) * (course._count?.enrollments ?? 0),
    thumbnail: course.thumbnail || null,
    gradient: course.gradient || GRADIENTS[index % GRADIENTS.length],
    icon: course.icon || '📘',
    description: course.description,
    instructorId: course.instructorId,
  };
  return normalizeCourse(mapped, index);
}

/**
 * Fetches all courses from the backend admin API (includes pending/rejected,
 * unlike the public course list which only shows approved courses).
 * Backend route: GET /api/admin/courses
 */
export async function fetchAdminCourses({ search = '', category = '', level = '', page = 1, limit = 100 } = {}) {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    if (category) params.category = category;
    if (level) params.level = level;

    const res = await API.get('/admin/courses', { params });
    const courses = res.data.data || [];
    return { data: courses.map(mapApiCourseToAdminCourse), meta: res.data.meta };
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not load courses.'));
  }
}

export async function updateCourseApprovalStatus(id, status) {
  try {
    const res = await API.put(`/admin/courses/${id}`, { status });
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not update course.'));
  }
}

export async function deleteAdminCourseApi(id) {
  try {
    await API.delete(`/admin/courses/${id}`);
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not delete course.'));
  }
}
