import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import CourseDrawer from '../../../components/admin/courses/CourseDrawer';
import CoursesHero from '../../../components/admin/courses/CoursesHero';
import CourseKpiRow from '../../../components/admin/courses/CourseKpiRow';
import TopPerformingCourses from '../../../components/admin/courses/TopPerformingCourses';
import CoursesFilters from '../../../components/admin/courses/CoursesFilters';
import CourseGrid from '../../../components/admin/courses/CourseGrid';
import { getCategories, computeRevenue } from '../../../utils/courseUtils';
import { exportToCSV } from '../../../utils/export';
import {
  fetchAdminCourses,
  updateCourseApprovalStatus,
  deleteAdminCourseApi,
} from '../../../api/adminCourses.api';
import { LoadingSpinner, EmptyState, ErrorState } from '../../../components/common/States';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [notice, setNotice] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const loadCourseData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fetchAdminCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Could not load courses.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(t);
  }, [notice]);

  const categories = useMemo(() => getCategories(courses), [courses]);

  const filtered = useMemo(
    () =>
      courses.filter((c) => {
        const q = searchQuery.toLowerCase();
        const matchQ =
          !q ||
          c.title.toLowerCase().includes(q) ||
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
      await deleteAdminCourseApi(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      showNotice('Course deleted.');
    } catch (err) {
      showNotice(err.message || 'Could not delete course.');
    }
  };

  const handleOpenAddDrawer = () => {
    setSelectedCourse(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (course) => {
    setSelectedCourse(course);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedCourse(null);
    setIsDrawerOpen(false);
  };

  // Approve / reject is the one course-level write the backend currently
  // exposes (PUT /admin/courses/:id with { status }). Full course
  // creation/editing (title, lessons, pricing) goes through the
  // instructor-facing course endpoints, not this admin panel, so we
  // surface that distinction instead of silently no-op-ing the save.
  const handleSaveCourse = async (savedCourse) => {
    if (!selectedCourse) {
      showNotice('Creating courses happens from the instructor dashboard — admins approve/reject here.');
      handleCloseDrawer();
      return;
    }
    try {
      const newStatus = savedCourse.active ? 'approved' : 'rejected';
      await updateCourseApprovalStatus(selectedCourse.id, newStatus);
      setCourses((prev) =>
        prev.map((c) => (c.id === selectedCourse.id ? { ...c, ...savedCourse, status: newStatus } : c))
      );
      showNotice('Course status updated.');
    } catch (err) {
      showNotice(err.message || 'Could not update course.');
    }
    handleCloseDrawer();
  };

  const handleExport = () => {
    exportToCSV(
      filtered,
      [
        'title',
        'level',
        'xp',
        'category',
        'lessons',
        'rating',
        'students',
        'completion',
        'hours',
        'active',
        'teacher',
        'price',
        'revenue',
      ],
      'lms-courses.csv'
    );
    showNotice('Export started.');
  };

  const hasFilters = Boolean(searchQuery || categoryFilter || levelFilter);

  if (isLoading) {
    return (
      <div className="admin-page relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
        <LoadingSpinner fullPage label="Loading courses…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
        <ErrorState message={error} onRetry={loadCourseData} />
      </div>
    );
  }

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <CoursesHero
        totalCount={courses.length.toLocaleString()}
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

      {filtered.length === 0 ? (
        <EmptyState title="No courses found" description="Try adjusting your search or filters." />
      ) : (
        <CourseGrid
          courses={filtered}
          onCreateCourse={handleOpenAddDrawer}
          onEdit={handleOpenEditDrawer}
          onClone={() => showNotice('Cloning requires the instructor dashboard.')}
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
            style={{
              background: 'var(--admin-surface-raised)',
              borderColor: 'var(--admin-border)',
            }}
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="admin-text-secondary hover:admin-text-primary"
              aria-label="Dismiss"
            >
              <MdClose size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Courses;
