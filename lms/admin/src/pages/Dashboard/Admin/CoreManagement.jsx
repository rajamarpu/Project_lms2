import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LuImagePlus, LuTrash2, LuUserRound } from 'react-icons/lu';
import { Button, EmptyState, EnterpriseTable, FilterBar, LoadingState, PageShell } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

function Modal({ title, children, onClose }) {
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="enterprise-card max-h-[90vh] w-full max-w-xl overflow-y-auto"><div className="mb-5 flex items-center justify-between gap-4"><h2 id="modal-title" className="section-title">{title}</h2><Button variant="ghost" onClick={onClose}>Close</Button></div>{children}</section></div>;
}

const Field = ({ label, ...props }) => <label className="block text-sm font-medium admin-text-primary">{label}<input {...props} className="admin-input mt-2" /></label>;

const backendOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
const avatarSrc = (value) => value?.startsWith('/uploads/') ? `${backendOrigin}${value}` : value;

function AvatarUpload({ value, name, uploading, error, onSelect, onRemove }) {
  const inputRef = useRef(null);
  return <section className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)]">
        {value ? <img src={avatarSrc(value)} alt={`${name || 'Account'} avatar preview`} className="h-full w-full object-cover" /> : <LuUserRound size={28} className="admin-text-muted" aria-hidden />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold admin-text-primary">Profile photo</p>
        <p className="mt-1 text-xs admin-text-muted">JPG, PNG, GIF or WebP. Maximum 5 MB.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" icon={LuImagePlus} disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}</Button>
          {value && <Button type="button" variant="ghost" icon={LuTrash2} disabled={uploading} onClick={onRemove}>Remove</Button>}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onSelect(file); event.target.value = ''; }} />
      </div>
    </div>
    {error && <p role="alert" className="mt-3 text-xs text-red-400">{error}</p>}
  </section>;
}

function UserManagement({ role, title, description }) {
  const navigate = useNavigate();
  const { studentId, teacherId } = useParams();
  const selectedId = role === 'user' ? studentId : teacherId;
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', avatar: '', status: 'approved' });
  const [uploading, setUploading] = useState(false); const [uploadError, setUploadError] = useState('');
  const load = () => { setLoading(true); setError(''); platformAdminApi.users(role).then((payload) => setRows(payload.data)).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(() => { let active = true; platformAdminApi.users(role).then((payload) => { if (active) setRows(payload.data); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [role]);
  const createRequested = searchParams.get('create') === '1';
  const filtered = useMemo(() => rows.filter((row) => `${row.name} ${row.email} ${row.status}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const selectedUser = rows.find((row) => row.id === selectedId);
  const basePath = role === 'user' ? '/dashboard/admin/students' : '/dashboard/admin/teachers';
  const mutate = async (action, success) => { setNotice(''); try { await action(); setNotice(success); load(); } catch (err) { setNotice(err.message); } };
  const closeModal = () => { setOpen(false); setUploadError(''); if (searchParams.has('create')) { const next = new URLSearchParams(searchParams); next.delete('create'); setSearchParams(next, { replace: true }); } };
  const uploadAvatar = async (file) => {
    setUploadError('');
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) { setUploadError('Choose a JPG, PNG, GIF, or WebP image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError('The image must be 5 MB or smaller.'); return; }
    setUploading(true);
    try { const payload = await platformAdminApi.uploadImage(file); setForm((current) => ({ ...current, avatar: payload.url })); }
    catch (err) { setUploadError(err.message); }
    finally { setUploading(false); }
  };
  const create = async (event) => { event.preventDefault(); setSaving(true); try { await platformAdminApi.createUser({ ...form, role }); closeModal(); setForm({ name: '', email: '', password: '', avatar: '', status: 'approved' }); setNotice(`${role === 'user' ? 'Learner' : 'Instructor'} created.`); load(); } catch (err) { setNotice(err.message); } finally { setSaving(false); } };
  const columns = [
    { key: 'name', header: 'Name', render: (row) => <div className="flex items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--admin-surface-raised)]">{row.avatar ? <img src={avatarSrc(row.avatar)} alt="" className="h-full w-full object-cover" /> : <LuUserRound size={16} className="admin-text-muted" aria-hidden />}</div><span className="font-medium admin-text-primary">{row.name}</span></div> }, { key: 'email', header: 'Email' }, { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Joined', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'actions', header: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={() => navigate(`${basePath}/${row.id}`)}>View profile</Button><Button variant="ghost" onClick={() => mutate(() => platformAdminApi.updateUser(row.id, { status: row.status === 'approved' ? 'suspended' : 'approved' }), row.status === 'approved' ? 'Account suspended.' : 'Account approved.')}>{row.status === 'approved' ? 'Suspend' : 'Approve'}</Button><Button variant="ghost" onClick={() => { if (window.confirm(`Delete ${row.name}? This cannot be undone.`)) mutate(() => platformAdminApi.deleteUser(row.id), 'Account deleted.'); }}>Delete</Button></div> },
  ];
  return <PageShell eyebrow="Persisted directory" title={title} description={description} actions={<Button onClick={() => setOpen(true)}>Add {role === 'user' ? 'learner' : 'instructor'}</Button>}>{notice && <p role="status" className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 text-sm admin-text-primary">{notice}</p>}<FilterBar value={query} onChange={setQuery} placeholder={`Search ${title.toLowerCase()}`} />{loading ? <LoadingState /> : error ? <EmptyState title="Could not load users" description={error} action={<Button onClick={load}>Retry</Button>} /> : <EnterpriseTable columns={columns} rows={filtered} />}{selectedId && !loading && !selectedUser && <Modal title="Profile unavailable" onClose={() => navigate(basePath)}><EmptyState title="Account not found" description="This account may have been removed or is outside the current directory." action={<Button onClick={() => navigate(basePath)}>Back to directory</Button>} /></Modal>}{selectedUser && <Modal title={`${role === 'user' ? 'Learner' : 'Instructor'} profile`} onClose={() => navigate(basePath)}><div className="space-y-5"><div className="flex items-center gap-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5"><div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-[var(--admin-surface-raised)]">{selectedUser.avatar ? <img src={avatarSrc(selectedUser.avatar)} alt="" className="h-full w-full object-cover" /> : <LuUserRound size={28} className="admin-text-muted" />}</div><div><h3 className="text-xl font-bold admin-text-primary">{selectedUser.name}</h3><p className="admin-text-muted">{selectedUser.email}</p><span className="mt-2 inline-flex rounded-full bg-[#7C3AED]/15 px-3 py-1 text-xs font-semibold text-[#8B5CF6]">{selectedUser.status}</span></div></div><dl className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[var(--admin-border)] p-4"><dt className="text-xs admin-text-muted">Role</dt><dd className="mt-1 font-semibold capitalize admin-text-primary">{selectedUser.role === 'user' ? 'Learner' : selectedUser.role}</dd></div><div className="rounded-xl border border-[var(--admin-border)] p-4"><dt className="text-xs admin-text-muted">Joined</dt><dd className="mt-1 font-semibold admin-text-primary">{new Date(selectedUser.createdAt).toLocaleDateString()}</dd></div></dl><div className="flex justify-end"><Button onClick={() => navigate(basePath)}>Back to directory</Button></div></div></Modal>}{(open || createRequested) && <Modal title={`Add ${role === 'user' ? 'learner' : 'instructor'}`} onClose={closeModal}><form onSubmit={create} className="space-y-4"><AvatarUpload value={form.avatar} name={form.name} uploading={uploading} error={uploadError} onSelect={uploadAvatar} onRemove={() => setForm({ ...form, avatar: '' })} /><Field label="Full name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><Field label="Email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Field label="Temporary password" type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><label className="block text-sm font-medium admin-text-primary">Initial status<select className="admin-select mt-2 w-full" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="approved">Approved</option><option value="pending">Pending approval</option></select></label><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button><Button disabled={saving || uploading}>{saving ? 'Creating…' : 'Create account'}</Button></div></form></Modal>}</PageShell>;
}

export const LearnersPage = () => <UserManagement role="user" title="Learners" description="Exact server-backed learner accounts and access status." />;
export const InstructorsPage = () => <UserManagement role="instructor" title="Instructors" description="Exact server-backed instructor accounts and access status." />;

export function CoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false); const [savingAction, setSavingAction] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', celebrityTeacher: '', price: 0 });
  const load = () => { setLoading(true); setError(''); platformAdminApi.courses().then((payload) => setRows(payload.data)).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(() => { let active = true; platformAdminApi.courses().then((payload) => { if (active) setRows(payload.data); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const createRequested = searchParams.get('create') === '1';
  const filtered = useMemo(() => rows.filter((row) => `${row.title} ${row.category} ${row.status}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const mutate = async (action, success) => { setNotice(''); try { await action(); setNotice(success); load(); } catch (err) { setNotice(err.message); } };
  const lifecycle = async (row, nextStatus) => {
    const payload = { status: nextStatus };
    if (nextStatus === 'rejected') { const reason = window.prompt('Enter the rejection reason'); if (!reason) return; payload.rejectionReason = reason; }
    if (nextStatus === 'scheduled') { const scheduledAt = window.prompt('Enter a future ISO date/time'); if (!scheduledAt) return; payload.scheduledAt = scheduledAt; }
    await mutate(() => platformAdminApi.updateCourse(row.id, payload), `Course moved to ${nextStatus}.`);
  };
  const create = async (event) => {
    event.preventDefault();
    const status = event.nativeEvent.submitter?.value === 'draft' ? 'draft' : 'approved';
    setSaving(true); setSavingAction(status);
    try {
      const payload = await platformAdminApi.createCourse({ ...form, price: Number(form.price), status });
      setOpen(false); setForm({ title: '', description: '', category: '', celebrityTeacher: '', price: 0 });
      if (searchParams.has('create')) { const next = new URLSearchParams(searchParams); next.delete('create'); setSearchParams(next, { replace: true }); }
      setNotice(status === 'approved' ? 'Course published and visible in the learner catalog.' : 'Course saved as a private draft.');
      load(); navigate(`/dashboard/admin/courses/${payload.data.id}/edit`);
    } catch (err) { setNotice(err.message); }
    finally { setSaving(false); setSavingAction(''); }
  };
  const columns = [
    { key: 'title', header: 'Course' }, { key: 'category', header: 'Category' }, { key: 'status', header: 'Lifecycle' },
    { key: 'instructor', header: 'Owner', render: (row) => row.instructor?.name || '—' }, { key: 'enrollments', header: 'Enrollments', render: (row) => row._count?.enrollments || 0 },
    { key: 'actions', header: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={() => navigate(`/dashboard/admin/courses/${row.id}/edit`)}>Edit</Button>{row.status !== 'approved' && <Button variant="ghost" onClick={() => lifecycle(row, 'approved')}>Publish</Button>}{row.status === 'approved' && <Button variant="ghost" onClick={() => lifecycle(row, 'draft')}>Unpublish</Button>}<Button variant="ghost" onClick={() => mutate(() => platformAdminApi.duplicateCourse(row.id), 'Draft copy created.')}>Duplicate</Button>{row.status !== 'archived' && <Button variant="ghost" onClick={() => lifecycle(row, 'archived')}>Archive</Button>}{row.status === 'archived' && <Button variant="ghost" onClick={() => lifecycle(row, 'draft')}>Restore</Button>}<Button variant="ghost" onClick={() => { if (window.confirm(`Delete ${row.title}? Existing enrollments and progress will also be deleted.`)) mutate(() => platformAdminApi.deleteCourse(row.id), 'Course deleted.'); }}>Delete</Button></div> },
  ];
  const closeCreate = () => { setOpen(false); if (searchParams.has('create')) { const next = new URLSearchParams(searchParams); next.delete('create'); setSearchParams(next, { replace: true }); } };
  return <PageShell eyebrow="Course operations" title="Courses" description="Canonical server-backed catalog and audited lifecycle management." actions={<Button onClick={() => setOpen(true)}>Create course</Button>}>{notice && <p role="status" className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 text-sm admin-text-primary">{notice}</p>}<FilterBar value={query} onChange={setQuery} placeholder="Search courses" />{loading ? <LoadingState /> : error ? <EmptyState title="Could not load courses" description={error} action={<Button onClick={load}>Retry</Button>} /> : <EnterpriseTable columns={columns} rows={filtered} />}{(open || createRequested) && <Modal title="Create course" onClose={closeCreate}><form onSubmit={create} className="space-y-4"><Field label="Title" required maxLength={100} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><label className="block text-sm font-medium admin-text-primary">Description<textarea className="admin-input mt-2 min-h-28" required maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><Field label="Category" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /><Field label="Instructor display name (optional)" value={form.celebrityTeacher} onChange={(event) => setForm({ ...form, celebrityTeacher: event.target.value })} /><Field label="Price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /><p className="text-xs admin-text-muted">Publish makes the course immediately visible in the learner catalog. Save draft keeps it private.</p><div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="ghost" onClick={closeCreate}>Cancel</Button><Button type="submit" value="draft" variant="ghost" disabled={saving}>{savingAction === 'draft' ? 'Saving…' : 'Save draft'}</Button><Button type="submit" value="approved" disabled={saving}>{savingAction === 'approved' ? 'Publishing…' : 'Publish course'}</Button></div></form></Modal>}</PageShell>;
}
