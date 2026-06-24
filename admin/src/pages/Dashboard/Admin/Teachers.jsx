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
import { fetchTeachers, updateTeacherStatus, deleteTeacher } from '../../../api/teachers.api';
import { LoadingSpinner, EmptyState, ErrorState } from '../../../components/common/States';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const loadTeacherData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fetchTeachers();
      setTeachers(data);
    } catch (err) {
      setError(err.message || 'Could not load teachers.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

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
    const now = new Date();
    const recent = teachers.filter((t) => {
      const d = new Date(t._raw?.createdAt || 0);
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }).length;
    if (teachers.length === 0) return '0%';
    const pct = Math.round((recent / teachers.length) * 100);
    return `+${pct}%`;
  }, [teachers]);

  // Inviting/adding a brand-new instructor requires a backend "create user"
  // endpoint that doesn't exist yet — instructors currently register
  // themselves through the public signup flow. Surfacing this honestly
  // instead of faking a local-only add that would vanish on refresh.
  const handleAddSave = () => {
    setActionError('Adding teachers from the admin panel needs a backend endpoint that does not exist yet. Instructors currently register via the signup flow and admins approve them here.');
  };

  const handleEditSave = async (form) => {
    setActionError(null);
    try {
      await updateTeacherStatus(editTeacher.id, form.enabled);
      setTeachers((prev) =>
        prev.map((t) => (t.id === editTeacher.id ? { ...t, ...form } : t))
      );
      if (selectedTeacher && selectedTeacher.id === editTeacher.id) {
        setSelectedTeacher((prev) => ({ ...prev, ...form }));
      }
      setEditTeacher(null);
    } catch (err) {
      setActionError(err.message || 'Could not update teacher.');
    }
  };

  const handleDelete = async (id) => {
    setActionError(null);
    try {
      await deleteTeacher(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      if (selectedTeacher?.id === id) setSelectedTeacher(null);
    } catch (err) {
      setActionError(err.message || 'Could not delete teacher.');
    }
  };

  const handleExport = () => {
    exportToCSV(
      filteredTeachers,
      ['name', 'style', 'course', 'enabled', 'students', 'rating', 'revenue', 'courses', 'email', 'phone', 'joinDate', 'bio'],
      'lms-teachers.csv'
    );
  };

  if (isLoading) {
    return (
      <div className="admin-page relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
        <LoadingSpinner fullPage label="Loading teachers…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
        <ErrorState message={error} onRetry={loadTeacherData} />
      </div>
    );
  }

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
      {actionError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between gap-3">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-300 shrink-0">✕</button>
        </div>
      )}

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

      {filteredTeachers.length === 0 ? (
        <EmptyState title="No teachers found" description="Try adjusting your search or filters." />
      ) : (
        <TeacherGrid
          teachers={filteredTeachers}
          onView={setSelectedTeacher}
          onEdit={setEditTeacher}
          onDelete={handleDelete}
        />
      )}

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
