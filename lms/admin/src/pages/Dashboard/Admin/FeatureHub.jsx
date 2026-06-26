import { useEffect, useState } from 'react';
import { Button, EmptyState, EnterpriseTable, PageShell } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const Field = ({ label, ...props }) => <label className="block text-sm font-medium admin-text-primary">{label}<input {...props} className="admin-input mt-2" /></label>;

export default function FeatureHub() {
  const [personalities, setPersonalities] = useState([]); const [reports, setReports] = useState([]); const [notice, setNotice] = useState('');
  const [personality, setPersonality] = useState({ name: '', title: '', description: '', systemPrompt: '', accent: '#6366f1' });
  const load = () => Promise.all([platformAdminApi.personalities(), platformAdminApi.communityReports()]).then(([a, b]) => { setPersonalities(a.data); setReports(b.data); }).catch((err) => setNotice(err.message));
  useEffect(load, []);
  const run = async (action, message, reset) => { setNotice(''); try { await action(); setNotice(message); reset?.(); await load(); } catch (err) { setNotice(err.message); } };
  const reportColumns = [
    { key: 'topic', header: 'Topic', render: (row) => row.post.topic.title },
    { key: 'author', header: 'Post author', render: (row) => row.post.author.name },
    { key: 'reason', header: 'Reason' }, { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="ghost" onClick={() => run(() => platformAdminApi.moderateCommunityReport(row.id, 'hide'), 'Post hidden.')}>Hide post</Button><Button variant="ghost" onClick={() => run(() => platformAdminApi.moderateCommunityReport(row.id, 'dismiss'), 'Report dismissed.')}>Dismiss</Button></div> },
  ];
  return <PageShell eyebrow="MYPROJECT parity" title="Engagement feature hub" description="Configure AI tutors and community moderation from persisted records.">
    {notice && <p role="status" className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 text-sm admin-text-primary">{notice}</p>}
    <section className="grid gap-5 xl:grid-cols-3">
      <form className="enterprise-card space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => platformAdminApi.createPersonality(personality), 'AI tutor created.', () => setPersonality({ name: '', title: '', description: '', systemPrompt: '', accent: '#6366f1' })); }}><h2 className="section-title">AI tutor personalities ({personalities.length})</h2><Field label="Name" required value={personality.name} onChange={(e) => setPersonality({ ...personality, name: e.target.value })} /><Field label="Teaching title" required value={personality.title} onChange={(e) => setPersonality({ ...personality, title: e.target.value })} /><label className="block text-sm font-medium admin-text-primary">System prompt<textarea required className="admin-input mt-2 min-h-28" value={personality.systemPrompt} onChange={(e) => setPersonality({ ...personality, systemPrompt: e.target.value })} /></label><Button>Create tutor</Button></form>
    </section>
    <section className="space-y-3"><h2 className="section-title">Community moderation</h2>{reports.length ? <EnterpriseTable columns={reportColumns} rows={reports} /> : <EmptyState title="No community reports" description="Reported posts will appear here for review." />}</section>
  </PageShell>;
}
