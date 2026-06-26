import { useState } from 'react';
import { Button, PageShell } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const fieldClass = 'w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 admin-text-primary';

export default function Communications() {
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [notification, setNotification] = useState({ role: 'user', type: 'system', title: '', message: '', actionUrl: '' });
  const [announcement, setAnnouncement] = useState({ title: '', body: '', publishedAt: '', expiresAt: '' });

  const submit = async (kind, operation, reset) => {
    setBusy(kind); setNotice('');
    try { const result = await operation(); setNotice(kind === 'notification' ? `Notification persisted for ${result.data.recipients} recipient(s).` : 'Announcement published.'); reset(); }
    catch (error) { setNotice(error.message); }
    finally { setBusy(''); }
  };

  return <PageShell eyebrow="Communications" title="Notifications and announcements" description="Send persisted messages to approved users. Delivery is in-app; email is not claimed without a configured provider.">
    {notice && <p role="status" className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 text-sm admin-text-primary">{notice}</p>}
    <div className="grid gap-5 xl:grid-cols-2">
      <form className="enterprise-card space-y-4" onSubmit={(event) => { event.preventDefault(); submit('notification', () => platformAdminApi.sendNotification(notification), () => setNotification({ role: 'user', type: 'system', title: '', message: '', actionUrl: '' })); }}>
        <div><h2 className="section-title">Send notification</h2><p className="section-description">Creates one database record for every eligible recipient.</p></div>
        <label className="block text-sm admin-text-primary">Audience<select className={`${fieldClass} mt-1`} value={notification.role} onChange={(event) => setNotification({ ...notification, role: event.target.value })}><option value="user">Learners</option><option value="instructor">Instructors</option><option value="admin">Administrators</option></select></label>
        <label className="block text-sm admin-text-primary">Category<select className={`${fieldClass} mt-1`} value={notification.type} onChange={(event) => setNotification({ ...notification, type: event.target.value })}>{['system', 'course', 'assignment', 'assessment', 'certificate', 'security'].map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="block text-sm admin-text-primary">Title<input required maxLength={120} className={`${fieldClass} mt-1`} value={notification.title} onChange={(event) => setNotification({ ...notification, title: event.target.value })} /></label>
        <label className="block text-sm admin-text-primary">Message<textarea required rows="4" className={`${fieldClass} mt-1`} value={notification.message} onChange={(event) => setNotification({ ...notification, message: event.target.value })} /></label>
        <label className="block text-sm admin-text-primary">Action URL (optional)<input className={`${fieldClass} mt-1`} placeholder="/courses" value={notification.actionUrl} onChange={(event) => setNotification({ ...notification, actionUrl: event.target.value })} /></label>
        <Button disabled={busy === 'notification'}>{busy === 'notification' ? 'Sending…' : 'Send notification'}</Button>
      </form>
      <form className="enterprise-card space-y-4" onSubmit={(event) => { event.preventDefault(); submit('announcement', () => platformAdminApi.createAnnouncement(announcement), () => setAnnouncement({ title: '', body: '', publishedAt: '', expiresAt: '' })); }}>
        <div><h2 className="section-title">Publish announcement</h2><p className="section-description">Visible to learners during its active date window.</p></div>
        <label className="block text-sm admin-text-primary">Title<input required maxLength={120} className={`${fieldClass} mt-1`} value={announcement.title} onChange={(event) => setAnnouncement({ ...announcement, title: event.target.value })} /></label>
        <label className="block text-sm admin-text-primary">Body<textarea required rows="6" className={`${fieldClass} mt-1`} value={announcement.body} onChange={(event) => setAnnouncement({ ...announcement, body: event.target.value })} /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm admin-text-primary">Publish at<input type="datetime-local" className={`${fieldClass} mt-1`} value={announcement.publishedAt} onChange={(event) => setAnnouncement({ ...announcement, publishedAt: event.target.value })} /></label><label className="block text-sm admin-text-primary">Expires at<input type="datetime-local" className={`${fieldClass} mt-1`} value={announcement.expiresAt} onChange={(event) => setAnnouncement({ ...announcement, expiresAt: event.target.value })} /></label></div>
        <Button disabled={busy === 'announcement'}>{busy === 'announcement' ? 'Publishing…' : 'Publish announcement'}</Button>
      </form>
    </div>
  </PageShell>;
}
