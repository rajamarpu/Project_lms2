import React, { useState, useMemo } from 'react';
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
import { useTeachersQuery } from '../../../api/reactQuery';
import teachersApi from '../../../api/teachers';

const normalizeTeacher = (teacher) => ({
  ...teacher,
  style: teacher.style || teacher.bio || 'Expert instructor',
  photo: teacher.avatar || null,
  enabled: teacher.status === 'active',
  rating: teacher.rating || 4.8,
  students: teacher.students || 0,
  revenue: teacher.revenue || 0,
  courses: teacher.courses || 1,
  joinDate: teacher.createdAt
    ? new Date(teacher.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    : '',
  bio: teacher.bio || 'Passionate educator building a better future.',
});

const buildTeacherPayload = (form) => ({
  name: form.name,
  email: form.email,
  phone: form.phone || undefined,
  bio: form.bio || undefined,
  avatar: form.avatar || undefined,
  status: form.enabled ? 'active' : 'suspended',
});

const Teachers = () => {
  const { data: teachersRes, refetch } = useTeachersQuery({ limit: 100 });
  const teachers = useMemo(
    () => (teachersRes?.data || []).map(normalizeTeacher),
    [teachersRes]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((t) => {
        const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter =
          filter === 'All' ? true : filter === 'Active' ? t.enabled : !t.enabled;
        return matchSearch && matchFilter;
      }),
    [teachers, searchQuery, filter]
  );

  const activeTeachers = teachers.filter((t) => t.enabled).length;

  const monthlyGrowth = useMemo(() => {
    const recent = teachers.filter((t) => {
      return t.joinDate.includes('2026') && (t.joinDate.includes('May') || t.joinDate.includes('Apr'));
    }).length;
    if (teachers.length === 0) return '0%';
    const pct = Math.max(8, Math.round((recent / teachers.length) * 100) + 12);
    return `+${pct}%`;
  }, [teachers]);

  const handleAddSave = async (form) => {
    await teachersApi.createTeacher(buildTeacherPayload(form));
    await refetch();
    setIsAddOpen(false);
  };

  const handleEditSave = async (form) => {
    if (!editTeacher) return;
    await teachersApi.updateTeacher(editTeacher.id, buildTeacherPayload(form));
    await refetch();
    setEditTeacher(null);
    if (selectedTeacher?.id === editTeacher.id) {
      setSelectedTeacher((prev) => ({ ...prev, ...form, photo: form.avatar || prev?.photo }));
    }
  };

  const handleDelete = async (id) => {
    await teachersApi.deleteTeacher(id);
    await refetch();
    if (selectedTeacher?.id === id) setSelectedTeacher(null);
  };

  const handleExport = () => {
    exportToCSV(
      filteredTeachers,
      [
        'name',
        'style',
        'course',
        'enabled',
        'students',
        'rating',
        'revenue',
        'courses',
        'email',
        'phone',
        'joinDate',
        'bio',
      ],
      'lms-teachers.csv'
    );
  };

  if (selectedTeacher) {
    const liveTeacher = teachers.find((t) => t.id === selectedTeacher.id) || selectedTeacher;
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
        totalCount={teachers.length.toLocaleString()}
        monthlyGrowth={monthlyGrowth}
        activeCount={activeTeachers}
        onAddTeacher={() => setIsAddOpen(true)}
        onInviteTeacher={() => setIsInviteOpen(true)}
        onExport={handleExport}
      />

      <TeacherKpiRow teachers={teachers} />

      <TopMentorsSection teachers={teachers} onViewProfile={setSelectedTeacher} />

      <TeachersFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      <TeacherGrid
        teachers={filteredTeachers}
        onView={setSelectedTeacher}
        onEdit={setEditTeacher}
        onDelete={handleDelete}
      />

      <TeacherPerformanceAnalytics teachers={teachers} />

      <TeacherDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Teacher"
        teacher={null}
        onSave={handleAddSave}
      />
      <TeacherDrawer
        isOpen={!!editTeacher}
        onClose={() => setEditTeacher(null)}
        title="Edit Teacher"
        teacher={editTeacher}
        onSave={handleEditSave}
      />

      <AnimatePresence>
        {isInviteOpen && (
          <InviteTeacherModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teachers;
