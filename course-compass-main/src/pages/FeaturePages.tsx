import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Flag, Loader2, Plus, Send, Sparkles } from "lucide-react";
import { featureApi } from "@/api/feature.api";
import { useAuth } from "@/store/AuthContext";
import { apiErrorMessage } from "@/utils/apiError";

type Person = { id: string; name: string; avatar?: string; role?: string };
type Topic = { id: string; title: string; description?: string; createdAt: string; createdBy: Person; _count: { posts: number } };
type Post = { id: string; body: string; createdAt: string; author: Person };
type Personality = { id: string; name: string; title: string; description?: string; avatar?: string; accent: string };
type ChatMessage = { id: string; role: string; content: string; createdAt: string };

const Page = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <div className="container py-10 md:py-12">
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
      <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-secondary/10 blur-3xl" aria-hidden />
      <div className="relative max-w-3xl">
        <p className="page-eyebrow">Learner feature hub</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
      </div>
    </section>
    <div className="mt-8">{children}</div>
  </div>
);

const ErrorText = ({ value }: { value: string }) =>
  value ? <p role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{value}</p> : null;

export function Community() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => featureApi.topics().then(({ data }) => setTopics(data.data)).catch((err) => setError(apiErrorMessage(err))).finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await featureApi.createTopic({ title, description });
      setTitle("");
      setDescription("");
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Page title="Learning community" description="Ask questions, share useful context, and learn with the wider cohort.">
      <ErrorText value={error} />
      <form onSubmit={create} className="glass-card mb-8 grid gap-3 p-5 md:grid-cols-[1fr_1.4fr_auto]">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Topic title" className="rounded-xl border border-border bg-background px-4 py-3" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="rounded-xl border border-border bg-background px-4 py-3" />
        <button className="btn-primary"><Plus className="h-4 w-4" />Create topic</button>
      </form>
      {loading ? <Loader2 className="mx-auto animate-spin text-primary" /> : <div className="grid gap-4 md:grid-cols-2">{topics.map((topic) => <Link key={topic.id} to={`/community/${topic.id}`} className="glass-card p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{topic.title}</h2><p className="mt-2 text-sm text-muted-foreground">{topic.description || "Community discussion"}</p></div><span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{topic._count.posts} posts</span></div><p className="mt-4 text-xs text-muted-foreground">Started by {topic.createdBy.name}</p></Link>)}</div>}
    </Page>
  );
}

export function CommunityTopic() {
  const { topicId = "" } = useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const load = () => featureApi.posts(topicId).then(({ data }) => { setTopic(data.topic); setPosts(data.data); }).catch((err) => setError(apiErrorMessage(err)));

  useEffect(() => { void load(); }, [topicId]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await featureApi.createPost(topicId, body);
      setBody("");
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const report = async (postId: string) => {
    const reason = window.prompt("Why should this post be reviewed?");
    if (!reason) return;
    try {
      await featureApi.reportPost(postId, reason);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Page title={topic?.title || "Community topic"} description={topic?.description || "Join the discussion."}>
      <ErrorText value={error} />
      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="glass-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{post.author.name}</p>
              <button onClick={() => report(post.id)} className="text-muted-foreground hover:text-destructive" aria-label="Report post">
                <Flag className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{post.body}</p>
            <p className="mt-3 text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </div>
      <form onSubmit={send} className="glass-card mt-6 flex gap-3 p-4">
        <textarea required value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a thoughtful reply" className="min-h-24 flex-1 rounded-xl border border-border bg-background p-3" />
        <button className="btn-primary self-end"><Send className="h-4 w-4" />Post</button>
      </form>
    </Page>
  );
}

export function AITutors() {
  const [people, setPeople] = useState<Personality[]>([]);
  const [selected, setSelected] = useState<Personality | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const roomId = selected ? `personality-${selected.id}` : "";

  useEffect(() => {
    featureApi.personalities().then(({ data }) => { setPeople(data.data); setSelected(data.data[0] || null); }).catch((err) => setError(apiErrorMessage(err)));
  }, []);

  useEffect(() => {
    if (roomId) featureApi.chat(roomId).then(({ data }) => setMessages(data.data)).catch((err) => setError(apiErrorMessage(err)));
  }, [roomId]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setError("");
    try {
      const { data } = await featureApi.sendChat({ roomId, content, personalityId: selected.id });
      setMessages((current) => [...current, data.data.userMessage, ...(data.data.assistantMessage ? [data.data.assistantMessage] : [])]);
      setContent("");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Page title="AI tutor personalities" description="Choose a teaching style and keep a persisted tutoring conversation.">
      <ErrorText value={error} />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          {people.map((person) => <button key={person.id} onClick={() => setSelected(person)} className={`glass-card w-full p-4 text-left ${selected?.id === person.id ? "border-primary" : ""}`}><p className="font-semibold">{person.name}</p><p className="text-xs text-muted-foreground">{person.title}</p></button>)}
          {!people.length && <p className="text-sm text-muted-foreground">No active personalities have been configured by an administrator.</p>}
        </aside>
        <section className="glass-card flex min-h-[480px] flex-col p-5">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.map((message) => <div key={message.id} className={`max-w-[85%] rounded-2xl p-3 text-sm ${message.role === "assistant" ? "bg-primary/10" : "ml-auto bg-secondary/15"}`}>{message.content}</div>)}
          </div>
          <form onSubmit={send} className="mt-4 flex gap-2">
            <input required disabled={!selected} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ask your tutor" className="flex-1 rounded-xl border border-border bg-background px-4" />
            <button disabled={!selected} className="btn-primary"><Sparkles className="h-4 w-4" />Send</button>
          </form>
        </section>
      </div>
    </Page>
  );
}
