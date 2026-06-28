import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { getAdminStats, getAdminUsers, getAdminCourses } from './admin';
import { getCourses } from './courses';
import { getTeachers } from './teachers';
import { getStudents } from './students';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 5,
    },
  },
});

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await getAdminStats();
      return res;
    },
  });
}

export function useCoursesQuery(params = {}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const res = await getCourses(params);
      return res;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminCoursesQuery(params = {}) {
  return useQuery({
    queryKey: ['admin', 'courses', params],
    queryFn: async () => {
      const res = await getAdminCourses(params);
      return res;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useTeachersQuery(params = {}) {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: async () => {
      const res = await getTeachers(params);
      return res;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useStudentsQuery(params = {}) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: async () => {
      const res = await getStudents(params);
      return res;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminUsersQuery(params = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const res = await getAdminUsers(params);
      return res;
    },
    staleTime: 1000 * 60 * 2,
  });
}
