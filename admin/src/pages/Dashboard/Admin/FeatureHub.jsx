import { useEffect, useState } from 'react';
import { Button, EmptyState, EnterpriseTable, PageShell, LoadingState } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const Field = ({ label, ...props }) => <label className="block text-sm font-medium admin-text-primary">{label}<input {...props} className="admin-input mt-2" /></label>;

export default function FeatureHub() {
  const [personalities, setPersonalities] = useState([]); const [sessions, setSessions] = useState([]); const [questions, setQuestions] = useState([]); const [reports, setReports] = useState([]); const [media, setMedia] = useState([]); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(true);
  const [personality, setPersonality] = useState({ name: '', title: '', description: '', systemPrompt: '', accent: '#6366f1' });
  const [session, setSession] = useState({ title: '', startsAt: '', durationMinutes: 60, meetingUrl: '' });
  const [question, setQuestion] = useState({ category: '', difficulty: 'medium', prompt: '', options: 'Yes\nNo', answer: 'Yes', explanation: '' });
  const [mediaFile, setMediaFile] = useState(null);
  const load = () => Promise.all([platformAdminApi.personalities(), platformAdminApi.liveSessions(), platformAdminApi.practiceQuestions(), platformAdminApi.communityReports(), platformAdminApi.mediaLibrary()]).then(([a, b, c, d, e]) => { setPersonalities(a.data); setSessions(b.data); setQuestions(c.data); setReports(d.data); setMedia(e.data); }).catch((err) => setNotice(err.message));
  useEffect(() => { load().finally(() => setBusy(false)); }, []);
  const run = async (action, message, reset) => { setNotice(''); try { await action(); setNotice(message); reset?.(); await load(); } catch (err) { setNotice(err.message); } };
  const uploadMedia = async (event) => {
    event.preventDefault();
    if (!mediaFile) return setNotice('Choose a file first.');
    const formData = new FormData();
    formData.append('file', mediaFile);
    await run(() => platformAdminApi.uploadMedia(formData), 'Media uploaded.', () => { setMediaFile(null); });
  };
  const reportColumns = [
    { key: 'topic', header: 'Topic', render: (row) => row.post.topic.title },
    { key: 'author', header: 'Post author', render: (row) => row.post.author.name },
    { key: 'reason', header: 'Reason' }, { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="ghost" onClick={() => run(() => platformAdminApi.moderateCommunityReport(row.id, 'hide'), 'Post hidden.')}>Hide post</Button><Button variant="ghost" onClick={() => run(() => platformAdminApi.moderateCommunityReport(row.id, 'dismiss'), 'Report dismissed.')}>Dismiss</Button></div> },
  ];
  return <PageShell eyebrow="MYPROJECT parity" title="Engagement feature hub" description="Configure AI tutors, live sessions, practice questions, and community moderation from persisted records.">
    {notice && <p role="status" className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 text-sm admin-text-primary">{notice}</p>}
    <section className="grid gap-5 xl:grid-cols-3">
      <form className="enterprise-card space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => platformAdminApi.createPersonality(personality), 'AI tutor created.', () => setPersonality({ name: '', title: '', description: '', systemPrompt: '', accent: '#6366f1' })); }}><h2 className="section-title">AI tutor personalities ({personalities.length})</h2><Field label="Name" required value={personality.name} onChange={(e) => setPersonality({ ...personality, name: e.target.value })} /><Field label="Teaching title" required value={personality.title} onChange={(e) => setPersonality({ ...personality, title: e.target.value })} /><label className="block text-sm font-medium admin-text-primary">System prompt<textarea required className="admin-input mt-2 min-h-28" value={personality.systemPrompt} onChange={(e) => setPersonality({ ...personality, systemPrompt: e.target.value })} /></label><Button>Create tutor</Button></form>
      <form className="enterprise-card space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => platformAdminApi.createLiveSession(session), 'Live session scheduled.', () => setSession({ title: '', startsAt: '', durationMinutes: 60, meetingUrl: '' })); }}><h2 className="section-title">Live sessions ({sessions.length})</h2><Field label="Title" required value={session.title} onChange={(e) => setSession({ ...session, title: e.target.value })} /><Field label="Start time" type="datetime-local" required value={session.startsAt} onChange={(e) => setSession({ ...session, startsAt: e.target.value })} /><Field label="Meeting URL" value={session.meetingUrl} onChange={(e) => setSession({ ...session, meetingUrl: e.target.value })} /><Button>Schedule session</Button></form>
      <form className="enterprise-card space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => platformAdminApi.createPracticeQuestion({ ...question, options: question.options.split('\n').map((item) => item.trim()).filter(Boolean), answer: question.answer }), 'Practice question created.', () => setQuestion({ category: '', difficulty: 'medium', prompt: '', options: 'Yes\nNo', answer: 'Yes', explanation: '' })); }}><h2 className="section-title">Practice questions ({questions.length})</h2><Field label="Category" required value={question.category} onChange={(e) => setQuestion({ ...question, category: e.target.value })} /><Field label="Prompt" required value={question.prompt} onChange={(e) => setQuestion({ ...question, prompt: e.target.value })} /><label className="block text-sm font-medium admin-text-primary">Options, one per line<textarea className="admin-input mt-2 min-h-20" value={question.options} onChange={(e) => setQuestion({ ...question, options: e.target.value })} /></label><Field label="Correct answer" required value={question.answer} onChange={(e) => setQuestion({ ...question, answer: e.target.value })} /><Button>Create question</Button></form>
    </section>
    <section className="enterprise-card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Media library ({media.length})</h2>
          <p className="section-description">Upload images, PDFs, and videos for reuse in courses and lessons.</p>
        </div>
        <form onSubmit={uploadMedia} className="flex flex-wrap items-center gap-2">
          <input type="file" accept="image/*,video/*,application/pdf" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} className="admin-input max-w-xs" />
          <Button type="submit" disabled={!mediaFile}>Upload file</Button>
        </form>
      </div>
      {busy && !media.length ? <LoadingState label="Loading media library" /> : media.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <article key={item.name} className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold admin-text-primary">{item.name}</p>
                  <p className="text-xs admin-text-muted">{item.type} · {(Number(item.size || 0) / 1024).toFixed(1)} KB</p>
                </div>
                <Button variant="ghost" onClick={() => run(() => platformAdminApi.deleteMedia(item.name), 'Media deleted.')}>Delete</Button>
              </div>
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}${item.url}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:underline">Preview file</a>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No media uploaded" description="Uploaded files will appear here for reuse across the platform." />}
    </section>
    <section className="space-y-3"><h2 className="section-title">Community moderation</h2>{reports.length ? <EnterpriseTable columns={reportColumns} rows={reports} /> : <EmptyState title="No community reports" description="Reported posts will appear here for review." />}</section>
  </PageShell>;
}
