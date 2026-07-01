import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { exportToCSV } from '../../../utils/export';
import TeachersHero from '../../../components/admin/teachers/TeachersHero';
import TeacherKpiRow from '../../../components/admin/teachers/TeacherKpiRow';
import TopMentorsSection from '../../../components/admin/teachers/TopMentorsSection';
import TeachersFilters from '../../../components/admin/teachers/TeachersFilters';
import TeacherGrid from '../../../components/admin/teachers/TeacherGrid';
import TeacherPerformanceAnalytics from '../../../components/admin/teachers/TeacherPerformanceAnalytics';
import TeacherDrawer from '../../../components/admin/teachers/TeacherDrawer';
import TeacherProfileView from '../../../components/admin/teachers/TeacherProfileView';
import InviteTeacherModal from '../../../components/admin/teachers/InviteTeacherModal';
import { apiFetch } from '../../../api/config';

function normalizeTeacher(t, i = 0) {
  const PALETTE = [
    'from-blue-600 to-indigo-600', 'from-red-500 to-orange-500',
    'from-yellow-400 to-amber-600', 'from-pink-500 to-rose-500', 'from-purple-500 to-pink-500'
  ];
  return {
    id: t.id,
    name: t.name || 'Unknown',
    email: t.email || '',
    bio: t.bio || '',
    style: t.bio ? t.bio.slice(0, 40) : 'Educator',
    course: t.courses > 0 ? `${t.courses} course${t.courses !== 1 ? 's' : ''}` : 'No courses yet',
    courses: t.courses || 0,
    activeCourses: t.activeCourses || 0,
    enabled: t.enabled ?? t.status === 'approved',
    status: t.status || 'pending',
    color: PALETTE[i % PALETTE.length],
    students: t.students || 0,
    rating: t.rating || 0,
    revenue: t.revenue || 0,
    joinDate: t.joinDate ? new Date(t.joinDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
    photo: t.avatar || null,
    avatar: t.avatar || null,
    verified: t.verified ?? t.status === 'approved',
    featured: t.courses >= 3,
    topMentor: t.students >= 100,
  };
}

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/instructors?limit=200');
      setTeachers((data.data || []).map(normalizeTeacher));
    } catch (err) {
      console.error('Failed to load instructors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const filteredTeachers = useMemo(
    () => teachers.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filter === 'All' ? true : filter === 'Active' ? t.enabled : !t.enabled;
      return matchSearch && matchFilter;
    }),
    [teachers, searchQuery, filter]
  );

  const activeTeachers = teachers.filter((t) => t.enabled).length;

  const monthlyGrowth = useMemo(() => {
    if (teachers.length === 0) return '0%';
    const now = new Date();
    const thisMonth = teachers.filter(t => {
      if (!t.joinDate || t.joinDate === 'N/A') return false;
      const d = new Date(t.joinDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const pct = Math.round((thisMonth / teachers.length) * 100);
    return `+${pct}%`;
  }, [teachers]);

  const handleToggleStatus = async (id) => {
    const teacher = teachers.find(t => t.id === id);
    if (!teacher) return;
    const newStatus = teacher.enabled ? 'suspended' : 'approved';
    try {
      await apiFetch(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setTeachers(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled, status: newStatus } : t));
    } catch (err) {
      console.error('Toggle status failed:', err);
    }
  };

  const handleAddSave = async (form) => {
    // Invite/register new teacher via admin - just reload to get fresh data
    await fetchTeachers();
  };

  const handleEditSave = async (form) => {
    if (!editTeacher) return;
    try {
      await apiFetch(`/admin/users/${editTeacher.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: form.name, status: form.enabled ? 'approved' : 'suspended' })
      });
      setTeachers(prev => prev.map(t => t.id === editTeacher.id ? { ...t, ...normalizeTeacher({ ...t, ...form }, 0) } : t));
      if (selectedTeacher?.id === editTeacher.id) {
        setSelectedTeacher(prev => ({ ...prev, ...form }));
      }
    } catch (err) {
      console.error('Edit save failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this instructor?')) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      setTeachers(prev => prev.filter(t => t.id !== id));
      if (selectedTeacher?.id === id) setSelectedTeacher(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleExport = () => {
    exportToCSV(
      filteredTeachers,
      ['name', 'email', 'bio', 'courses', 'students', 'rating', 'revenue', 'status', 'joinDate'],
      'lms-teachers.csv'
    );
  };

  if (selectedTeacher) {
    const liveTeacher = teachers.find(t => t.id === selectedTeacher.id) || selectedTeacher;
    return (
      <>
        <TeacherProfileView
          teacher={liveTeacher}
          onBack={() => setSelectedTeacher(null)}
          onEdit={setEditTeacher}
          onDelete={handleDelete}
        />
        <TeacherDrawer
          isOpen={!!editTeacher}
          onClose={() => setEditTeacher(null)}
          title="Edit Teacher"
          teacher={editTeacher}
          onSave={handleEditSave}
        />
      </>
    );
  }

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <TeachersHero
        totalCount={loading ? '...' : teachers.length.toLocaleString()}
        monthlyGrowth={monthlyGrowth}
        activeCount={activeTeachers}
        onAddTeacher={() => setIsAddOpen(true)}
        onInviteTeacher={() => setIsInviteOpen(true)}
        onExport={handleExport}
      />

      <TeacherKpiRow teachers={teachers} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--admin-surface)' }} />
          ))}
        </div>
      ) : (
        <>
          <TopMentorsSection teachers={teachers} onViewProfile={setSelectedTeacher} />
          <TeachersFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} filter={filter} onFilterChange={setFilter} />
          <TeacherGrid teachers={filteredTeachers} onView={setSelectedTeacher} onEdit={setEditTeacher} onDelete={handleDelete} />
          <TeacherPerformanceAnalytics teachers={teachers} />
        </>
      )}

      <TeacherDrawer isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Teacher" teacher={null} onSave={handleAddSave} />
      <TeacherDrawer isOpen={!!editTeacher} onClose={() => setEditTeacher(null)} title="Edit Teacher" teacher={editTeacher} onSave={handleEditSave} />

      <AnimatePresence>
        {isInviteOpen && (
          <InviteTeacherModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teachers;
