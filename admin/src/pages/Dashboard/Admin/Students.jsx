import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MdSearch, MdOutlineCalendarToday, MdKeyboardArrowDown } from 'react-icons/md';
import { exportToCSV } from '../../../utils/export';
import StudentsHero from '../../../components/admin/students/StudentsHero';
import StudentAnalyticsCards from '../../../components/admin/students/StudentAnalyticsCards';
import StudentInsightsStrip from '../../../components/admin/students/StudentInsightsStrip';
import StudentTable from '../../../components/admin/students/StudentTable';
import StudentProfileDrawer from '../../../components/admin/students/StudentProfileDrawer';
import AddStudentDrawer from '../../../components/admin/students/AddStudentDrawer';
import NotificationModal from '../../../components/admin/students/NotificationModal';
import DeleteStudentModal from '../../../components/admin/students/DeleteStudentModal';
import { apiFetch, API_BASE } from '../../../api/config';

const filterSelectClass = 'w-full rounded-xl py-2.5 pl-4 pr-10 text-xs admin-text-primary focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all cursor-pointer appearance-none border bg-[var(--admin-surface)] border-[var(--admin-border)]';
const filterInputClass = 'w-full rounded-xl py-2.5 pl-10 pr-4 text-xs admin-text-primary placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all border bg-[var(--admin-surface)] border-[var(--admin-border)]';

function mapStatus(status) {
  if (!status) return 'Pending';
  if (status === 'approved') return 'Active';
  if (status === 'suspended') return 'Blocked';
  if (status === 'rejected') return 'Blocked';
  return 'Pending';
}

function mapUser(u) {
  const activeEnrollment = u.enrollments?.find(e => e.status === 'active' || e.status === 'completed') || u.enrollments?.[0];
  const avgProgress = u.progress ?? (u.enrollments?.length > 0
    ? Math.round(u.enrollments.reduce((s, e) => s + e.progress, 0) / u.enrollments.length)
    : 0);
  return {
    id: u.id,
    name: u.name || 'Unknown',
    email: u.email || '',
    avatar: u.avatar || null,
    enrolledCourse: activeEnrollment?.course?.title || null,
    mentorName: activeEnrollment?.mentor || null,
    progress: avgProgress,
    status: mapStatus(u.status),
    joinedDate: u.createdAt ? u.createdAt.split('T')[0] : '',
    badge: u.enrollments?.length > 0 ? 'Enrolled' : 'New Learner',
    phone: null,
    plan: u.enrollments?.length > 0 ? 'Active Plan' : 'Free',
    xp: avgProgress * 30,
    lastActive: 'N/A',
    certificates: u.certificates ?? 0,
    streak: 0,
    enrollmentsCount: u.enrollmentsCount ?? 0,
  };
}

const Students = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter');

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/users?role=user&limit=200');
      setStudents((data.data || []).map(mapUser));
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    // Fetch courses and instructors for filter dropdowns
    apiFetch('/admin/courses?limit=100').then(d => setCourses(d.data || [])).catch(() => {});
    apiFetch('/admin/instructors?limit=100').then(d => setInstructors(d.data || [])).catch(() => {});
  }, [fetchStudents]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const displayedStudents = useMemo(
    () => students.filter((student) => {
      const matchesSearch = searchQuery === '' ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.enrolledCourse && student.enrolledCourse.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === '' || student.status === statusFilter;
      const matchesCourse = courseFilter === '' || (student.enrolledCourse && student.enrolledCourse.toLowerCase().includes(courseFilter.toLowerCase()));
      const matchesTeacher = teacherFilter === '' || student.mentorName === teacherFilter;
      const matchesDate = dateFilter === '' || student.joinedDate.includes(dateFilter);

      let matchesRoute = true;
      if (filter === 'active') matchesRoute = student.status === 'Active';
      else if (filter === 'new') {
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        matchesRoute = student.joinedDate.startsWith(thisMonth);
      } else if (filter === 'analytics') matchesRoute = student.progress > 80;

      return matchesSearch && matchesStatus && matchesCourse && matchesTeacher && matchesDate && matchesRoute;
    }),
    [students, searchQuery, statusFilter, courseFilter, teacherFilter, dateFilter, filter]
  );

  const monthlyGrowth = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthCount = students.filter(s => s.joinedDate?.startsWith(thisMonth)).length;
    if (students.length === 0) return '0%';
    const pct = Math.round((thisMonthCount / students.length) * 100);
    return `+${pct}%`;
  }, [students]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToModify, setStudentToModify] = useState(null);

  const handleOpenDrawer = (student) => { setSelectedStudent(student); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setTimeout(() => setSelectedStudent(null), 300); };
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleOpenNotifyModal = (student) => { setStudentToModify(student); setIsNotifyModalOpen(true); };
  const handleCloseNotifyModal = () => { setIsNotifyModalOpen(false); setTimeout(() => setStudentToModify(null), 300); };
  const handleOpenDeleteModal = (student) => { setStudentToModify(student); setIsDeleteModalOpen(true); };
  const handleCloseDeleteModal = () => { setIsDeleteModalOpen(false); setTimeout(() => setStudentToModify(null), 300); };

  const handleDeleteStudent = async (id) => {
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      setStudents(students.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      // Still remove from UI if possible
      setStudents(students.filter(s => s.id !== id));
    }
    handleCloseDeleteModal();
    if (selectedStudent?.id === id) handleCloseDrawer();
  };

  const handleExport = () => {
    exportToCSV(
      displayedStudents,
      ['name', 'email', 'enrolledCourse', 'mentorName', 'plan', 'status', 'joinedDate', 'progress', 'certificates'],
      'lms-students.csv'
    );
  };

  const handleGenerateReport = () => {
    const active = students.filter(s => s.status === 'Active').length;
    const avgProgress = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.progress ?? 0), 0) / students.length)
      : 0;
    exportToCSV(
      [{ reportDate: new Date().toISOString().split('T')[0], totalStudents: students.length, activeStudents: active, averageCompletion: `${avgProgress}%`, filteredCount: displayedStudents.length }],
      ['reportDate', 'totalStudents', 'activeStudents', 'averageCompletion', 'filteredCount'],
      'lms-students-report.csv'
    );
  };

  // Build dynamic filter options from real API data
  const courseOptions = useMemo(() => [...new Set(courses.map(c => c.title).filter(Boolean))].sort(), [courses]);
  const instructorOptions = useMemo(() => [...new Set(instructors.map(i => i.name).filter(Boolean))].sort(), [instructors]);

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <StudentsHero
        totalCount={loading ? '...' : students.length.toLocaleString()}
        monthlyGrowth={monthlyGrowth}
        onAddStudent={handleOpenAddModal}
        onExport={handleExport}
        onGenerateReport={handleGenerateReport}
      />

      <StudentAnalyticsCards students={students} />
      <StudentInsightsStrip students={students} />

      <div className="relative z-10 flex flex-wrap gap-3 items-center rounded-2xl p-4 border shadow-lg admin-surface border-[var(--admin-border)]">
        <div className="relative min-w-[200px] flex-1">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 admin-text-secondary" size={18} />
          <input type="text" placeholder="Search students, email, or course..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={filterInputClass} />
        </div>

        <div className="relative min-w-[110px]">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={filterSelectClass}>
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Blocked">Blocked</option>
          </select>
          <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none" size={16} />
        </div>

        <div className="relative min-w-[140px]">
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className={filterSelectClass}>
            <option value="">Course</option>
            {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none" size={16} />
        </div>

        <div className="relative min-w-[140px]">
          <select value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)} className={filterSelectClass}>
            <option value="">Teacher</option>
            {instructorOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none" size={16} />
        </div>

        <div className="relative flex items-center rounded-xl px-3 py-2 text-xs admin-text-primary min-w-[160px] border admin-surface border-[var(--admin-border)]">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="bg-transparent border-none w-full text-xs admin-text-primary focus:outline-none cursor-pointer [color-scheme:var(--color-scheme)]" />
          <MdOutlineCalendarToday className="admin-text-secondary ml-2 pointer-events-none shrink-0" size={16} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--admin-surface)' }} />
          ))}
        </div>
      ) : (
        <StudentTable
          students={displayedStudents}
          onViewProfile={handleOpenDrawer}
          onNotify={handleOpenNotifyModal}
          onEdit={(student) => { setStudentToModify(student); setIsAddModalOpen(true); }}
          onDelete={handleOpenDeleteModal}
        />
      )}

      <StudentProfileDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} student={selectedStudent} />

      <AddStudentDrawer
        isOpen={isAddModalOpen}
        onClose={() => { handleCloseAddModal(); setStudentToModify(null); }}
        studentToEdit={studentToModify}
        courses={courseOptions}
        instructors={instructorOptions}
        onAdd={async (newStudent) => {
          if (studentToModify) {
            try {
              const dbStatus = newStudent.status === 'Active' ? 'approved' : newStudent.status === 'Blocked' ? 'suspended' : 'pending';
              const res = await apiFetch(`/admin/users/${studentToModify.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: newStudent.name, email: newStudent.email, status: dbStatus })
              });
              if (res.success) {
                setStudents(students.map(s => s.id === studentToModify.id ? { ...s, ...newStudent } : s));
              }
            } catch (err) {
              console.error('Update error:', err);
            }
          } else {
            // Register via backend with a secure random temp password
            const tempPwd = `LMS${Math.random().toString(36).slice(2, 10).toUpperCase()}!`;
            try {
              const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newStudent.name, email: newStudent.email, password: tempPwd, role: 'user' })
              });
              const data = await res.json();
              if (data.success) {
                await fetchStudents(); // refresh full list from API
              }
            } catch (err) {
              console.error('Register error:', err);
            }
          }
          handleCloseAddModal();
          setStudentToModify(null);
        }}
      />

      <AnimatePresence>
        {isNotifyModalOpen && <NotificationModal student={studentToModify} onClose={handleCloseNotifyModal} />}
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
