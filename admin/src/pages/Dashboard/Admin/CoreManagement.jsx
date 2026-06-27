import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBookOpen, LuCircleCheck, LuClock3, LuGraduationCap, LuIndianRupee, LuUsers } from 'react-icons/lu';
import { Button, EmptyState, EnterpriseTable, FilterBar, LoadingState, PageShell, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');
const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
const isStrongPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(String(value || ''));
const avatarUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const explicitBackendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const origin = explicitBackendUrl
    ? explicitBackendUrl.replace(/\/$/, '')
    : /^https?:\/\//i.test(apiUrl)
      ? apiUrl.replace(/\/api\/?$/, '')
      : window.location.origin;
  return `${origin}${value}`;
};

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="enterprise-card max-h-[90vh] w-full max-w-xl overflow-y-auto">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="section-title">{title}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        {children}
      </section>
    </div>
  );
}

const Field = ({ label, ...props }) => (
  <label className="block text-sm font-medium admin-text-primary">
    {label}
    <input {...props} className="admin-input mt-2" />
  </label>
);

const toggleId = (items, id) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

function UserManagement({ role, title, description }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', status: 'approved' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatarId, setUploadingAvatarId] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    platformAdminApi.users(role).then((payload) => setRows(payload.data)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    platformAdminApi.users(role).then((payload) => { if (active) setRows(payload.data); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role]);

  const filtered = useMemo(() => rows.filter((row) => `${row.name} ${row.email} ${row.status}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const approvedCount = rows.filter((row) => row.status === 'approved').length;
  const pendingCount = rows.filter((row) => row.status === 'pending').length;
  const avatarPreview = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : ''), [avatarFile]);

  const mutate = async (action, success) => {
    setNotice('');
    try {
      await action();
      setNotice(success);
      load();
    } catch (err) {
      setNotice(err.message);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    if (!isStrongPassword(form.password)) {
      setNotice('Temporary password must be 8-128 characters and include uppercase, lowercase, and a number.');
      return;
    }
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('email', form.email);
      payload.append('password', form.password);
      payload.append('status', form.status);
      payload.append('role', role);
      if (role === 'instructor' && avatarFile) payload.append('avatar', avatarFile);
      await platformAdminApi.createUser(payload);
      setOpen(false);
      setForm({ name: '', email: '', password: '', status: 'approved' });
      setAvatarFile(null);
      setNotice(`${role === 'user' ? 'Learner' : 'Instructor'} created.`);
      load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const updateAvatar = async (row, file) => {
    if (!file) return;
    setUploadingAvatarId(row.id);
    setNotice('');
    try {
      const payload = new FormData();
      payload.append('avatar', file);
      await platformAdminApi.updateUser(row.id, payload);
      setNotice('Instructor image updated.');
      load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setUploadingAvatarId('');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
            {row.avatar ? (
              <img src={avatarUrl(row.avatar)} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold admin-text-primary">{row.name?.charAt(0)?.toUpperCase() || '?'}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold admin-text-primary">{row.name}</p>
            {row.role === 'instructor' && <p className="text-xs admin-text-muted">Instructor profile</p>}
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Joined', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => mutate(() => platformAdminApi.updateUser(row.id, { status: row.status === 'approved' ? 'suspended' : 'approved' }), row.status === 'approved' ? 'Account suspended.' : 'Account approved.')}>{row.status === 'approved' ? 'Suspend' : 'Approve'}</Button>
          {role === 'instructor' && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  void updateAvatar(row, file);
                  event.target.value = '';
                }}
              />
              <span className="admin-btn admin-btn-ghost">{uploadingAvatarId === row.id ? 'Uploading...' : 'Update image'}</span>
            </label>
          )}
          <Button variant="ghost" onClick={() => { if (window.confirm(`Delete ${row.name}? This cannot be undone.`)) mutate(() => platformAdminApi.deleteUser(row.id), 'Account deleted.'); }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell eyebrow="Persisted directory" title={title} description={description} actions={<Button onClick={() => setOpen(true)}>Add {role === 'user' ? 'learner' : 'instructor'}</Button>}>
      {notice && <p role="status" className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 text-sm admin-text-primary">{notice}</p>}
      <StatGrid>
        <StatWidget label={`Total ${role === 'user' ? 'students' : 'instructors'}`} value={formatCount(rows.length)} icon={role === 'user' ? LuUsers : LuGraduationCap} tone="blue" footer="All accounts" source={title} onClick={() => navigate(role === 'user' ? '/dashboard/admin/students' : '/dashboard/admin/teachers')} ariaLabel={`Open ${title.toLowerCase()} list`} />
        <StatWidget label="Approved" value={formatCount(approvedCount)} icon={LuCircleCheck} tone="green" footer="Can access the platform" source="Account status" onClick={() => navigate(role === 'user' ? '/dashboard/admin/students' : '/dashboard/admin/teachers')} ariaLabel={`Open approved ${title.toLowerCase()}`} />
        <StatWidget label="Pending" value={formatCount(pendingCount)} icon={LuClock3} tone="red" footer="Waiting for action" source="Review queue" onClick={() => navigate(role === 'user' ? '/dashboard/admin/students' : '/dashboard/admin/teachers')} ariaLabel={`Open pending ${title.toLowerCase()}`} />
      </StatGrid>
      <FilterBar value={query} onChange={setQuery} placeholder={`Search ${title.toLowerCase()}`} />
      {loading ? <LoadingState /> : error ? <EmptyState title="Could not load users" description={error} action={<Button onClick={load}>Retry</Button>} /> : <EnterpriseTable columns={columns} rows={filtered} />}
      {open && (
        <Modal title={`Add ${role === 'user' ? 'learner' : 'instructor'}`} onClose={() => setOpen(false)}>
          <form onSubmit={create} className="space-y-4">
            <Field label="Full name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Field label="Email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <label className="block text-sm font-medium admin-text-primary">
              Temporary password
              <input
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="admin-input mt-2"
                placeholder="Example: Instructor123"
              />
              <span className="mt-2 block text-xs admin-text-muted">Use 8-128 characters with at least one uppercase letter, one lowercase letter, and one number.</span>
            </label>
            {role === 'instructor' && (
              <label className="block text-sm font-medium admin-text-primary">
                Instructor image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="admin-input mt-2 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                  onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                />
                <span className="mt-2 block text-xs admin-text-muted">Optional. Uploaded image will be saved as the instructor avatar.</span>
                {avatarPreview && (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
                    <img src={avatarPreview} alt="Instructor preview" className="h-16 w-16 rounded-2xl object-cover" />
                    <div>
                      <p className="text-sm font-semibold admin-text-primary">Preview</p>
                      <p className="text-xs admin-text-muted">{avatarFile?.name}</p>
                    </div>
                  </div>
                )}
              </label>
            )}
            <label className="block text-sm font-medium admin-text-primary">Initial status
              <select className="admin-select mt-2 w-full" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="approved">Approved</option>
                <option value="pending">Pending approval</option>
              </select>
            </label>
            <Button disabled={saving}>{saving ? 'Creating...' : 'Create account'}</Button>
          </form>
        </Modal>
      )}
    </PageShell>
  );
}

export const LearnersPage = () => <UserManagement role="user" title="Learners" description="Exact server-backed learner accounts and access status." />;
export const InstructorsPage = () => <UserManagement role="instructor" title="Instructors" description="Exact server-backed instructor accounts and access status." />;

export function CoursesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: '', level: 'Beginner', celebrityTeacher: '', thumbnail: '', price: 0, instructorId: '', learningPathIds: [] });
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    platformAdminApi.courses().then((payload) => setRows(payload.data)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    Promise.allSettled([platformAdminApi.courses(), platformAdminApi.users('instructor'), platformAdminApi.learningPaths()]).then(([coursesRes, instructorsRes, learningPathsRes]) => {
      if (!active) return;
      if (coursesRes.status === 'fulfilled') setRows(coursesRes.value.data);
      if (instructorsRes.status === 'fulfilled') setInstructors(instructorsRes.value.data || []);
      if (learningPathsRes.status === 'fulfilled') setLearningPaths(learningPathsRes.value.data || []);
    }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => rows.filter((row) => `${row.title} ${row.category} ${row.status}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const publishedCount = rows.filter((row) => row.status === 'approved').length;
  const draftCount = rows.filter((row) => row.status === 'draft').length;
  const enrollmentCount = rows.reduce((sum, row) => sum + Number(row._count?.enrollments || 0), 0);
  const estimatedRevenue = rows.reduce((sum, row) => sum + (Number(row.price || 0) * Number(row._count?.enrollments || 0)), 0);

  const mutate = async (action, success) => {
    setNotice('');
    try {
      await action();
      setNotice(success);
      load();
    } catch (err) {
      setNotice(err.message);
    }
  };

  const lifecycle = async (row, nextStatus) => {
    const payload = { status: nextStatus };
    if (nextStatus === 'rejected') {
      const reason = window.prompt('Enter the rejection reason');
      if (!reason) return;
      payload.rejectionReason = reason;
    }
    if (nextStatus === 'scheduled') {
      const scheduledAt = window.prompt('Enter a future ISO date/time');
      if (!scheduledAt) return;
      payload.scheduledAt = scheduledAt;
    }
    await mutate(() => platformAdminApi.updateCourse(row.id, payload), `Course moved to ${nextStatus}.`);
  };

  const create = async (event) => {
    event.preventDefault();
    const status = event.nativeEvent.submitter?.value === 'draft' ? 'draft' : 'approved';
    setSaving(true);
    setSavingAction(status);
    try {
      let thumbnail = form.thumbnail;
      if (thumbnailFile) {
        const uploadPayload = new FormData();
        uploadPayload.append('file', thumbnailFile);
        const uploadResult = await platformAdminApi.uploadMedia(uploadPayload);
        thumbnail = uploadResult.url;
      }
      const payload = await platformAdminApi.createCourse({ ...form, thumbnail, price: Number(form.price), status });
      setOpen(false);
      setForm({ title: '', description: '', category: '', level: 'Beginner', celebrityTeacher: '', thumbnail: '', price: 0, instructorId: '', learningPathIds: [] });
      setThumbnailFile(null);
      setNotice(status === 'approved' ? 'Course published and visible in the learner catalog.' : 'Course saved as a private draft.');
      load();
      navigate(`/dashboard/admin/courses/${payload.data.id}/edit`);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSaving(false);
      setSavingAction('');
    }
  };

  const thumbnailPreview = useMemo(() => {
    if (thumbnailFile) return URL.createObjectURL(thumbnailFile);
    return form.thumbnail || '';
  }, [thumbnailFile, form.thumbnail]);

  useEffect(() => () => {
    if (thumbnailFile && thumbnailPreview.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview);
  }, [thumbnailFile, thumbnailPreview]);

  const columns = [
    { key: 'title', header: 'Course' },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Lifecycle' },
    { key: 'instructor', header: 'Owner', render: (row) => row.instructor?.name || '-' },
    { key: 'learningPaths', header: 'Learning path', render: (row) => row.learningPaths?.length ? row.learningPaths.map((path) => path.title).join(', ') : '—' },
    { key: 'enrollments', header: 'Enrollments', render: (row) => row._count?.enrollments || 0 },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => navigate(`/dashboard/admin/courses/${row.id}/edit`)}>Edit</Button>
          {row.status !== 'approved' && <Button variant="ghost" onClick={() => lifecycle(row, 'approved')}>Publish</Button>}
          {row.status === 'approved' && <Button variant="ghost" onClick={() => lifecycle(row, 'draft')}>Unpublish</Button>}
          <Button variant="ghost" onClick={() => mutate(() => platformAdminApi.duplicateCourse(row.id), 'Draft copy created.')}>Duplicate</Button>
          {row.status !== 'archived' && <Button variant="ghost" onClick={() => lifecycle(row, 'archived')}>Archive</Button>}
          {row.status === 'archived' && <Button variant="ghost" onClick={() => lifecycle(row, 'draft')}>Restore</Button>}
          <Button variant="ghost" onClick={() => { if (window.confirm(`Delete ${row.title}? Existing enrollments and progress will also be deleted.`)) mutate(() => platformAdminApi.deleteCourse(row.id), 'Course deleted.'); }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell eyebrow="Course operations" title="Courses" description="Canonical server-backed catalog and audited lifecycle management." actions={<Button onClick={() => setOpen(true)}>Create course</Button>}>
      {notice && <p role="status" className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 text-sm admin-text-primary">{notice}</p>}
      <StatGrid>
        <StatWidget label="Total courses" value={formatCount(rows.length)} icon={LuBookOpen} tone="blue" footer={`${formatCount(draftCount)} drafts`} source="Course catalog" onClick={() => navigate('/dashboard/admin/courses')} ariaLabel="Open courses list" />
        <StatWidget label="Published courses" value={formatCount(publishedCount)} icon={LuCircleCheck} tone="green" footer="Visible to learners" source="Approved courses" onClick={() => navigate('/dashboard/admin/courses')} ariaLabel="Open published courses" />
        <StatWidget label="Total enrollments" value={formatCount(enrollmentCount)} icon={LuGraduationCap} tone="red" footer="Across all courses" source="Enrollment records" onClick={() => navigate('/dashboard/admin/enrollments')} ariaLabel="Open enrollment analytics" />
        <StatWidget label="Course revenue" value={formatCurrency(estimatedRevenue)} icon={LuIndianRupee} tone="navy" footer="Price x enrollments" source="Catalog estimate" onClick={() => navigate('/dashboard/admin/billing')} ariaLabel="Open billing records" />
      </StatGrid>
      <FilterBar value={query} onChange={setQuery} placeholder="Search courses" />
      {loading ? <LoadingState /> : error ? <EmptyState title="Could not load courses" description={error} action={<Button onClick={load}>Retry</Button>} /> : <EnterpriseTable columns={columns} rows={filtered} />}
      {open && (
        <Modal title="Create course" onClose={() => setOpen(false)}>
          <form onSubmit={create} className="space-y-4">
            <Field label="Title" required maxLength={100} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <label className="block text-sm font-medium admin-text-primary">Description
              <textarea className="admin-input mt-2 min-h-28" required maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
            <Field label="Category" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            <label className="block text-sm font-medium admin-text-primary">Level
              <select className="admin-select mt-2 w-full" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </label>
            <Field label="Instructor display name (optional)" value={form.celebrityTeacher} onChange={(event) => setForm({ ...form, celebrityTeacher: event.target.value })} />
            <label className="block text-sm font-medium admin-text-primary">Course image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="admin-input mt-2 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                onChange={(event) => setThumbnailFile(event.target.files?.[0] || null)}
              />
              <span className="mt-2 block text-xs admin-text-muted">Optional. Upload an image or use a thumbnail URL below.</span>
            </label>
            <Field label="Thumbnail URL (optional)" value={form.thumbnail} onChange={(event) => setForm({ ...form, thumbnail: event.target.value })} />
            {thumbnailPreview && (
              <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
                <p className="mb-3 text-sm font-semibold admin-text-primary">Course image preview</p>
                <img src={thumbnailPreview} alt="Course thumbnail preview" className="h-40 w-full rounded-2xl object-cover" />
              </div>
            )}
            <label className="block text-sm font-medium admin-text-primary">Assigned instructor
              <select className="admin-select mt-2 w-full" value={form.instructorId} onChange={(event) => setForm({ ...form, instructorId: event.target.value })}>
                <option value="">Auto-assign least loaded instructor</option>
                {instructors.map((instructor) => <option key={instructor.id} value={instructor.id}>{instructor.name}</option>)}
              </select>
            </label>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium admin-text-primary">Assign to learning path</legend>
              <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
                {learningPaths.length ? learningPaths.map((path) => (
                  <label key={path.id} className="flex items-center gap-3 text-sm admin-text-primary">
                    <input
                      type="checkbox"
                      checked={form.learningPathIds.includes(path.id)}
                      onChange={() => setForm({ ...form, learningPathIds: toggleId(form.learningPathIds, path.id) })}
                    />
                    <span>{path.title}</span>
                  </label>
                )) : <p className="text-xs admin-text-muted">No learning paths available yet.</p>}
              </div>
            </fieldset>
            <Field label="Price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            <p className="text-xs admin-text-muted">Publish makes the course immediately visible in the learner catalog. Save draft keeps it private.</p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="submit" value="draft" variant="ghost" disabled={saving}>{savingAction === 'draft' ? 'Saving...' : 'Save draft'}</Button>
              <Button type="submit" value="approved" disabled={saving}>{savingAction === 'approved' ? 'Publishing...' : 'Publish course'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </PageShell>
  );
}
