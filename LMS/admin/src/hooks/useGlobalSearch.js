import { useCallback, useEffect, useRef, useState } from 'react';
import { searchGlobal } from '../utils/globalSearch';
import { getStudents } from '../api/students';
import { getTeachers } from '../api/teachers';
import { getCourses } from '../api/courses';

const DEBOUNCE_MS = 300;

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const sourcesRef = useRef(null);
  const timerRef = useRef(null);

  const refreshSources = useCallback(async () => {
    try {
      // Avoid hammering the backend: limit results and short-circuit if recently fetched
      const studentsLimit = 50;
      const teachersLimit = 50;
      const coursesLimit = 100;

      const [studentsRes, teachersRes, coursesRes] = await Promise.allSettled([
        getStudents({ limit: studentsLimit }),
        getTeachers({ limit: teachersLimit }),
        getCourses({ limit: coursesLimit }),
      ]);

      const students = studentsRes.status === 'fulfilled' ? studentsRes.value.data || [] : [];
      const teachers = teachersRes.status === 'fulfilled' ? teachersRes.value.data || [] : [];
      const courses = coursesRes.status === 'fulfilled' ? coursesRes.value.data || [] : [];

      sourcesRef.current = { students, teachers, courses, enrollments: [], certificates: [], payments: [] };
      // mark fetched time
      sourcesRef.current._fetchedAt = Date.now();
    } catch (e) {
      sourcesRef.current = { students: [], teachers: [], courses: [], enrollments: [], certificates: [], payments: [] };
    }
  }, []);

  useEffect(() => {
    // initial fetch
    refreshSources();
  }, [refreshSources]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    timerRef.current = setTimeout(() => {
      // Refresh sources if not fetched yet or older than 60s
      const age = sourcesRef.current?._fetchedAt ? Date.now() - sourcesRef.current._fetchedAt : Infinity;
      if (!sourcesRef.current || age > 60_000) refreshSources();
      const found = searchGlobal(trimmed, sourcesRef.current);
      setResults(found);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, refreshSources]);

  return {
    query,
    setQuery,
    results,
    loading,
    refreshSources,
  };
}
