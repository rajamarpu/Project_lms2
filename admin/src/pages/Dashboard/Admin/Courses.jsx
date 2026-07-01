import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import CourseDrawer from '../../../components/admin/courses/CourseDrawer';
import CoursesHero from '../../../components/admin/courses/CoursesHero';
import CourseKpiRow from '../../../components/admin/courses/CourseKpiRow';
import TopPerformingCourses from '../../../components/admin/courses/TopPerformingCourses';
import CoursesFilters from '../../../components/admin/courses/CoursesFilters';
import CourseGrid from '../../../components/admin/courses/CourseGrid';
import { getCategories } from '../../../utils/courseUtils';
import { exportToCSV } from '../../../utils/export';
import { apiFetch, API_BASE, getAuthHeaders } from '../../../api/config';

// Normalize a raw API course record for the UI
function normalizeCourse(c) {
  return {
    ...c,
    id: c.id,
    title: c.title || 'Untitled Course',
    level: c.level || 'Beginner',
    xp: c.xp || '1000 XP',
    category: c.category || 'General',
    lessons: c.lessons ?? c._count?.lessons ?? 0,
    rating: parseFloat(c.rating) || 4.5,
    students: c.students ?? c._count?.enrollments ?? 0,
    completion: c.completion || 0,
    hours: c.duration || 'Self-paced',
    active: c.status === 'approved' || c.active === true,
    teacher: c.celebrityTeacher || c.instructor?.name || 'Unassigned',
    price: c.price || 0,
    revenue: c.revenue ?? ((c.price || 0) * (c.students ?? 0)),
    thumbnail: c.thumbnail || null,
    gradient: c.gradient || 'from-blue-600 via-blue-500 to-cyan-400',
    icon: c.icon || '🤖',
    status: c.status || 'pending',
    instructorId: c.instructorId || c.instructor?.id,
  };
}

function computeRevenue(c) {
  return c.revenue || (c.price || 0) * (c.students || 0);
}

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [notice, setNotice] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/courses?limit=200');
      setCourses((data.data || []).map(normalizeCourse));
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(t);
  }, [notice]);

  const categories = useMemo(() => getCategories(courses), [courses]);

  const filtered = useMemo(
    () => courses.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchQ = !q || c.title.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        (c.teacher && c.teacher.toLowerCase().includes(q));
      const matchCat = !categoryFilter || c.category === categoryFilter;
      const matchLvl = !levelFilter || c.level === levelFilter;
      return matchQ && matchCat && matchLvl;
    }),
    [courses, searchQuery, categoryFilter, levelFilter]
  );

  const activeCount = courses.filter((c) => c.active).length;
  const totalRevenue = courses.reduce((sum, c) => sum + computeRevenue(c), 0);

  const showNotice = (message) => setNotice(message);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await apiFetch(`/admin/courses/${id}`, { method: 'DELETE' });
      setCourses((prev) => prev.filter((c) => c.id !== id));
      showNotice('Course deleted.');
    } catch (err) {
      console.error('Delete failed:', err);
      showNotice('Delete failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleOpenAddDrawer = () => { setSelectedCourse(null); setIsDrawerOpen(true); };
  const handleOpenEditDrawer = (course) => { setSelectedCourse(course); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setSelectedCourse(null); setIsDrawerOpen(false); };

  const handleSaveCourse = async (savedCourse) => {
    try {
      let result;
      if (savedCourse.id && courses.some(c => c.id === savedCourse.id)) {
        // Update existing
        const res = await apiFetch(`/admin/courses/${savedCourse.id}`, {
          method: 'PUT',
          body: JSON.stringify(savedCourse)
        });
        result = normalizeCourse(res.data);
        setCourses(prev => prev.map(c => c.id === result.id ? result : c));
        showNotice('Course updated.');
      } else {
        // Create new via courses endpoint
        const res = await fetch(`${API_BASE}/courses`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...savedCourse, status: 'approved' })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        result = normalizeCourse(data.data);
        setCourses(prev => [result, ...prev]);
        showNotice('Course created.');
      }
    } catch (err) {
      console.error('Save failed:', err);
      showNotice('Save failed: ' + (err.message || 'Unknown error'));
    }
    handleCloseDrawer();
  };

  const handleClone = async (course) => {
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: `${course.title} (Copy)`,
          description: course.description,
          category: course.category,
          level: course.level,
          price: course.price,
          thumbnail: course.thumbnail,
          celebrityTeacher: course.teacher,
          gradient: course.gradient,
          icon: course.icon,
          xp: course.xp,
          status: 'pending'
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const cloned = normalizeCourse(data.data);
      setCourses(prev => [cloned, ...prev]);
      showNotice('Course cloned as draft.');
    } catch (err) {
      showNotice('Clone failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleExport = () => {
    exportToCSV(
      filtered,
      ['title', 'level', 'xp', 'category', 'lessons', 'rating', 'students', 'active', 'teacher', 'price', 'revenue', 'status'],
      'lms-courses.csv'
    );
    showNotice('Export started.');
  };

  const hasFilters = Boolean(searchQuery || categoryFilter || levelFilter);

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <CoursesHero
        totalCount={loading ? '...' : courses.length.toLocaleString()}
        totalRevenue={totalRevenue}
        activeCount={activeCount}
        onCreateCourse={handleOpenAddDrawer}
        onExport={handleExport}
      />

      <CourseKpiRow courses={courses} />

      <TopPerformingCourses courses={courses} onEdit={handleOpenEditDrawer} />

      <CoursesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        levelFilter={levelFilter}
        onLevelChange={setLevelFilter}
        categories={categories}
        resultCount={filtered.length}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--admin-surface)' }} />
          ))}
        </div>
      ) : (
        <CourseGrid
          courses={filtered}
          onCreateCourse={handleOpenAddDrawer}
          onEdit={handleOpenEditDrawer}
          onClone={handleClone}
          onAnalytics={() => showNotice('Course analytics — opening soon.')}
          onPreview={() => showNotice('Course preview — opening soon.')}
          onDelete={handleDelete}
          hasFilters={hasFilters}
        />
      )}

      <CourseDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveCourse}
        courseToEdit={selectedCourse}
      />

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl text-sm font-medium admin-text-primary"
            style={{ background: 'var(--admin-surface-raised)', borderColor: 'var(--admin-border)' }}
          >
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="admin-text-secondary hover:admin-text-primary" aria-label="Dismiss">
              <MdClose size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Courses;
