import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, ClipboardCheck, FileQuestion, Loader2, Sparkles } from "lucide-react";
import { platformApi } from "@/api/platform.api";
import { toast } from "sonner";

type Question = { id: string; type: string; prompt: string; options?: string[]; points: number };
type Attempt = { id: string; score?: number; passed?: boolean; submittedAt?: string };
type Assessment = { id: string; title: string; description?: string; questions: Question[]; attempts: Attempt[]; attemptLimit: number };
type Submission = { id: string; status: string; score?: number; feedback?: string; text?: string };
type Assignment = { id: string; title: string; description: string; maxPoints: number; dueAt?: string; submissions: Submission[] };

export default function LearningWork() {
  const { courseId } = useParams<{ courseId: string }>();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = () =>
    platformApi
      .courseWork(courseId!)
      .then(({ data }) => {
        setAssessments(data.data.assessments);
        setAssignments(data.data.assignments);
      })
      .catch(() => toast.error("Course work could not be loaded."))
      .finally(() => setLoading(false));

  useEffect(() => {
    let active = true;
    platformApi
      .courseWork(courseId!)
      .then(({ data }) => {
        if (active) {
          setAssessments(data.data.assessments);
          setAssignments(data.data.assignments);
        }
      })
      .catch(() => toast.error("Course work could not be loaded."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  const stats = useMemo(
    () => [
      { label: "Assessments", value: assessments.length, tone: "text-primary" },
      { label: "Assignments", value: assignments.length, tone: "text-secondary" },
      { label: "Open tasks", value: assignments.filter((item) => !item.submissions.length).length, tone: "text-emerald-500" },
    ],
    [assessments.length, assignments],
  );

  const submitAssessment = async (item: Assessment) => {
    setBusy(item.id);
    try {
      const { data } = await platformApi.submitAssessment(item.id, answers);
      toast.success(data.data.requiresManualGrade ? "Assessment submitted for grading." : `Assessment submitted: ${data.data.score}%`);
      await load();
    } catch {
      toast.error("Assessment could not be submitted. Check the attempt limit.");
    } finally {
      setBusy("");
    }
  };

  const submitAssignment = async (item: Assignment) => {
    const text = drafts[item.id]?.trim();
    if (!text) return toast.error("Add your assignment response.");
    setBusy(item.id);
    try {
      await platformApi.submitAssignment(item.id, { text });
      toast.success("Assignment submitted.");
      await load();
    } catch {
      toast.error("Assignment could not be submitted.");
    } finally {
      setBusy("");
    }
  };

  if (loading) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading course work</span>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10">
      <Link to={`/learn/${courseId}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to course player
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-secondary/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Coursework center
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Assessments and assignments in one focused workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Submit work, review persisted scores, and track where each task stands without losing course context.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className={`text-2xl font-extrabold ${item.tone}`}>{item.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="surface-card">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Assessments</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Answer the prompts and submit when you are ready.</p>
          <div className="mt-6 space-y-4">
            {assessments.length ? (
              assessments.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-muted/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {item.questions.length} questions
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {item.questions.map((question) => (
                      <fieldset key={question.id} className="rounded-xl border border-border bg-card p-4">
                        <legend className="text-sm font-medium">
                          {question.prompt} <span className="text-muted-foreground">({question.points} pt)</span>
                        </legend>
                        <div className="mt-3 space-y-2">
                          {question.options?.map((option) => (
                            <label key={option} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-muted">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={() => setAnswers({ ...answers, [question.id]: option })}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>

                  {item.attempts.length ? (
                    <div className="mt-4 rounded-xl border border-border bg-background p-3 text-sm">
                      Latest score: {item.attempts.at(-1)?.score ?? "Pending manual grade"}
                      {item.attempts.at(-1)?.passed !== undefined && ` · ${item.attempts.at(-1)?.passed ? "Passed" : "Not passed"}`}
                    </div>
                  ) : (
                    <button type="button" className="btn-primary mt-4" disabled={busy === item.id} onClick={() => submitAssessment(item)}>
                      {busy === item.id ? "Submitting..." : "Submit assessment"}
                    </button>
                  )}
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No published assessments.</p>
            )}
          </div>
        </section>

        <section className="surface-card">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Assignments</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Write, submit, and keep track of instructor feedback.</p>
          <div className="mt-6 space-y-4">
            {assignments.length ? (
              assignments.map((item) => {
                const submission = item.submissions[0];
                return (
                  <article key={item.id} className="rounded-2xl border border-border bg-muted/20 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                        {item.maxPoints} points
                      </span>
                    </div>

                    {item.dueAt && <p className="mt-3 text-xs text-muted-foreground">Due {new Date(item.dueAt).toLocaleString()}</p>}

                    <label className="mt-4 block text-sm font-medium">
                      Your response
                      <textarea
                        className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background p-3"
                        value={drafts[item.id] ?? submission?.text ?? ""}
                        onChange={(event) => setDrafts({ ...drafts, [item.id]: event.target.value })}
                        disabled={submission?.status === "graded"}
                      />
                    </label>

                    {submission ? (
                      <div className="mt-4 rounded-xl border border-border bg-background p-3 text-sm">
                        <p>Status: {submission.status}</p>
                        {submission.score !== undefined && <p>Score: {submission.score}/{item.maxPoints}</p>}
                        {submission.feedback && <p className="mt-1">Feedback: {submission.feedback}</p>}
                      </div>
                    ) : (
                      <button type="button" className="btn-primary mt-4" disabled={busy === item.id} onClick={() => submitAssignment(item)}>
                        {busy === item.id ? "Submitting..." : "Submit assignment"}
                      </button>
                    )}
                  </article>
                );
              })
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No published assignments.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-10 rounded-[2rem] border border-border bg-gradient-to-r from-primary/10 via-card to-secondary/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="page-eyebrow">Coursework guidance</p>
            <h3 className="mt-2 text-xl font-bold">Keep submissions, grading, and feedback tied to the course.</h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <BadgeCheck className="h-4 w-4" />
            Production-ready workflow
          </div>
        </div>
      </section>
    </div>
  );
}
