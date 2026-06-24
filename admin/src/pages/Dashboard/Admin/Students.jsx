import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  MdSearch,
  MdOutlineCalendarToday,
  MdKeyboardArrowDown,
} from 'react-icons/md';
import { exportToCSV } from '../../../utils/export';
import { fetchStudents, updateStudentStatus, deleteStudent } from '../../../api/students.api';

import StudentsHero from '../../../components/admin/students/StudentsHero';
import StudentAnalyticsCards from '../../../components/admin/students/StudentAnalyticsCards';
import StudentInsightsStrip from '../../../components/admin/students/StudentInsightsStrip';
import StudentTable from '../../../components/admin/students/StudentTable';
import StudentProfileDrawer from '../../../components/admin/students/StudentProfileDrawer';
import AddStudentDrawer from '../../../components/admin/students/AddStudentDrawer';
import NotificationModal from '../../../components/admin/students/NotificationModal';
import DeleteStudentModal from '../../../components/admin/students/DeleteStudentModal';
import { LoadingSpinner, EmptyState, ErrorState } from '../../../components/common/States';

const filterSelectClass =
  'w-full rounded-xl py-2.5 pl-4 pr-10 text-xs admin-text-primary focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all cursor-pointer appearance-none border bg-[var(--admin-surface)] border-[var(--admin-border)]';
const filterInputClass =
  'w-full rounded-xl py-2.5 pl-10 pr-4 text-xs admin-text-primary placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all border bg-[var(--admin-surface)] border-[var(--admin-border)]';

const Students = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter');

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fetchStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Could not load students.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const displayedStudents = useMemo(
    () =>
      students.filter((student) => {
        const matchesSearch =
          searchQuery === '' ||
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.enrolledCourse.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === '' || student.status === statusFilter;
        const matchesCourse =
          courseFilter === '' ||
          student.enrolledCourse.toLowerCase().includes(courseFilter.toLowerCase());
        const matchesTeacher = teacherFilter === '' || student.mentorName === teacherFilter;
        const matchesBadge = badgeFilter === '' || student.badge === badgeFilter;
        const matchesDate = dateFilter === '' || student.joinedDate.includes(dateFilter);

        let matchesRoute = true;
        if (filter === 'active') matchesRoute = student.status === 'Active';
        else if (filter === 'new') matchesRoute = student.joinedDate.includes('2026-05');
        else if (filter === 'analytics') matchesRoute = student.progress > 80;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCourse &&
          matchesTeacher &&
          matchesBadge &&
          matchesDate &&
          matchesRoute
        );
      }),
    [
      students,
      searchQuery,
      statusFilter,
      courseFilter,
      teacherFilter,
      badgeFilter,
      dateFilter,
      filter,
    ]
  );

  const monthlyGrowth = useMemo(() => {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonth = students.filter((s) => s.joinedDate?.includes(thisMonthKey)).length;
    if (students.length === 0) return '0%';
    const pct = Math.round((thisMonth / students.length) * 100);
    return `+${pct}%`;
  }, [students]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToModify, setStudentToModify] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleOpenDrawer = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedStudent(null), 300);
  };

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleOpenNotifyModal = (student) => {
    setStudentToModify(student);
    setIsNotifyModalOpen(true);
  };
  const handleCloseNotifyModal = () => {
    setIsNotifyModalOpen(false);
    setTimeout(() => setStudentToModify(null), 300);
  };

  const handleOpenDeleteModal = (student) => {
    setStudentToModify(student);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTimeout(() => setStudentToModify(null), 300);
  };

  const handleDeleteStudent = async (id) => {
    setActionError(null);
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      handleCloseDeleteModal();
      if (selectedStudent?.id === id) handleCloseDrawer();
    } catch (err) {
      setActionError(err.message || 'Could not delete student.');
    }
  };

  // Backend currently supports updating status/role for existing users.
  // "Add"/"Edit" here updates status optimistically; full profile-field
  // editing (phone, plan, etc.) is not yet a backend capability, so we
  // update what the API supports and reflect everything else locally
  // until those fields exist server-side.
  const handleSaveStudent = async (newStudent) => {
    setActionError(null);
    try {
      if (studentToModify) {
        await updateStudentStatus(studentToModify.id, newStudent.status);
        setStudents((prev) =>
          prev.map((s) => (s.id === studentToModify.id ? { ...s, ...newStudent } : s))
        );
      } else {
        // Creating brand-new users from the admin panel requires a
        // dedicated backend "create user" endpoint, which doesn't exist
        // yet — surface that clearly instead of silently faking it.
        setActionError('Creating new students from the admin panel needs a backend endpoint that does not exist yet. Students currently sign up from the learner app.');
        return;
      }
      handleCloseAddModal();
      setStudentToModify(null);
    } catch (err) {
      setActionError(err.message || 'Could not save student.');
    }
  };

  const handleExport = () => {
    exportToCSV(
      displayedStudents,
      [
        'name',
        'email',
        'phone',
        'enrolledCourse',
        'mentorName',
        'plan',
        'status',
        'joinedDate',
        'progress',
        'xp',
        'lastActive',
        'certificates',
        'streak',
      ],
      'lms-students.csv'
    );
  };

  const handleGenerateReport = () => {
    const active = students.filter((s) => s.status === 'Active').length;
    const avgProgress =
      students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + (s.progress ?? 0), 0) / students.length)
        : 0;
    const report = [
      {
        reportDate: new Date().toISOString().split('T')[0],
        totalStudents: students.length,
        activeStudents: active,
        averageCompletion: `${avgProgress}%`,
        filteredCount: displayedStudents.length,
      },
    ];
    exportToCSV(
      report,
      ['reportDate', 'totalStudents', 'activeStudents', 'averageCompletion', 'filteredCount'],
      'lms-students-report.csv'
    );
  };

  if (isLoading) {
    return (
      <div className="admin-page relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
        <LoadingSpinner fullPage label="Loading students…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
        <ErrorState message={error} onRetry={loadStudents} />
      </div>
    );
  }

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      {actionError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between gap-3">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-300 shrink-0">✕</button>
        </div>
      )}

      <StudentsHero
        totalCount={students.length.toLocaleString()}
        monthlyGrowth={monthlyGrowth}
        onAddStudent={handleOpenAddModal}
        onExport={handleExport}
        onGenerateReport={handleGenerateReport}
      />

      <StudentAnalyticsCards students={students} />

      <StudentInsightsStrip students={students} />

      <div className="relative z-10 flex flex-wrap gap-3 items-center rounded-2xl p-4 border shadow-lg admin-surface border-[var(--admin-border)]">
        <div className="relative min-w-[200px] flex-1">
          <MdSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 admin-text-secondary"
            size={18}
          />
          <input
            type="text"
            placeholder="Search students, email, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={filterInputClass}
          />
        </div>

        <div className="relative min-w-[110px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={filterSelectClass}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
          <MdKeyboardArrowDown
            className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none"
            size={16}
          />
        </div>

        <div className="relative min-w-[120px]">
          <input
            type="text"
            placeholder="Course"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className={filterInputClass.replace('pl-10', 'pl-4')}
          />
        </div>

        <div className="relative min-w-[120px]">
          <input
            type="text"
            placeholder="Mentor"
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className={filterInputClass.replace('pl-10', 'pl-4')}
          />
        </div>

        <div className="relative min-w-[110px]">
          <select
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
            className={filterSelectClass}
          >
            <option value="">Badge</option>
            <option value="Top Learner">Top Learner</option>
            <option value="Quiz Master">Quiz Master</option>
          </select>
          <MdKeyboardArrowDown
            className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none"
            size={16}
          />
        </div>

        <div className="relative flex items-center rounded-xl px-3 py-2 text-xs admin-text-primary min-w-[160px] border admin-surface border-[var(--admin-border)]">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent border-none w-full text-xs admin-text-primary focus:outline-none cursor-pointer [color-scheme:var(--color-scheme)]"
          />
          <MdOutlineCalendarToday
            className="admin-text-secondary ml-2 pointer-events-none shrink-0"
            size={16}
          />
        </div>
      </div>

      {displayedStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <StudentTable
          students={displayedStudents}
          onViewProfile={handleOpenDrawer}
          onNotify={handleOpenNotifyModal}
          onEdit={(student) => {
            setStudentToModify(student);
            setIsAddModalOpen(true);
          }}
          onDelete={handleOpenDeleteModal}
        />
      )}

      <StudentProfileDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        student={selectedStudent}
      />

      <AddStudentDrawer
        isOpen={isAddModalOpen}
        onClose={() => {
          handleCloseAddModal();
          setStudentToModify(null);
        }}
        studentToEdit={studentToModify}
        onAdd={handleSaveStudent}
      />

      <AnimatePresence>
        {isNotifyModalOpen && (
          <NotificationModal student={studentToModify} onClose={handleCloseNotifyModal} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <DeleteStudentModal
            student={studentToModify}
            onClose={handleCloseDeleteModal}
            onConfirm={() => handleDeleteStudent(studentToModify.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
