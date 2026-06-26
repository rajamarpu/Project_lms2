import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  FileQuestion,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Eye,
  Star,
  Award,
} from "lucide-react";
import { platformApi } from "@/api/platform.api";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { toast } from "sonner";

type Question = {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  points: number;
  correctAnswer?: string;
  explanation?: string;
};

type Attempt = {
  id: string;
  score?: number;
  passed?: boolean;
  submittedAt?: string;
  answers?: Record<string, unknown>;
};

type Assessment = {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  attempts: Attempt[];
  attemptLimit: number;
};

type Submission = {
  id: string;
  status: string;
  score?: number;
  feedback?: string;
  text?: string;
  gradedAt?: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  dueAt?: string;
  submissions: Submission[];
};

export default function LearningWork() {
  const { courseId } = useParams<{ courseId: string }>();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAssessment, setPendingAssessment] = useState<Assessment | null>(null);
  const [viewingAttempt, setViewingAttempt] = useState<{ assessment: Assessment; attempt: Attempt } | null>(null);

  const load = useCallback(() => {
    platformApi
      .courseWork(courseId!)
      .then(({ data }) => {
        setAssessments(data.data.assessments);
        setAssignments(data.data.assignments);
      })
      .catch(() => toast.error("Course work could not be loaded."))
      .finally(() => setLoading(false));
  }, [courseId]);

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
    return () => { active = false; };
  }, [courseId]);

  useRefreshOnFocus(load, [load]);

  const handleConfirmSubmit = async () => {
    if (!pendingAssessment) return;
    setBusy(pendingAssessment.id);
    setConfirmOpen(false);
    try {
      const { data } = await platformApi.submitAssessment(pendingAssessment.id, answers);
      toast.success(
        data.data.requiresManualGrade
          ? "Assessment submitted for grading."
          : `Assessment submitted: ${data.data.score}%`
      );
      setAnswers({});
      await load();
    } catch {
      toast.error("Assessment could not be submitted. Check the attempt limit.");
    } finally {
      setBusy("");
      setPendingAssessment(null);
    }
  };

  const submitAssessment = (item: Assessment) => {
    const unanswered = item.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }
    setPendingAssessment(item);
    setConfirmOpen(true);
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
      <div className="container flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-shell container py-6 sm:py-8 lg:py-10 max-w-6xl">
      <Link
        to={`/learn/${courseId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to course player
      </Link>

      <PageHeader
        icon={FileQuestion}
        label="Course Work"
        title="Assessments & Assignments"
        description="Submit work and review scores and instructor feedback."
      />

      {/* Assessment Review Modal */}
      {viewingAttempt && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-16 overflow-y-auto animate-fade-in">
          <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-2xl w-full p-6 mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold">Assessment Review</h3>
              <button
                type="button"
                onClick={() => setViewingAttempt(null)}
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Score Summary */}
            <div className="mb-6 rounded-2xl border border-border bg-muted/30 p-5 text-center">
              <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${
                viewingAttempt.attempt.passed ? "bg-emerald-500/10" : "bg-destructive/10"
              }`}>
                {viewingAttempt.attempt.passed ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                )}
              </div>
              <p className="text-3xl font-bold">{viewingAttempt.attempt.score ?? "—"}%</p>
              <p className={`mt-1 text-sm font-medium ${viewingAttempt.attempt.passed ? "text-emerald-500" : "text-destructive"}`}>
                {viewingAttempt.attempt.passed ? "Passed" : "Not Passed"}
              </p>
            </div>

            {/* Questions Review */}
            <div className="space-y-5">
              {viewingAttempt.assessment.questions.map((question, idx) => {
                const userAnswer = (viewingAttempt.attempt.answers as Record<string, unknown>)?.[question.id];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className="rounded-2xl border border-border bg-card/50 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-medium text-sm">
                        <span className="text-primary font-bold">Q{idx + 1}.</span> {question.prompt}
                      </p>
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground">({question.points} pt{question.points !== 1 ? "s" : ""})</span>
                    </div>

                    {question.type === "mcq-single" && question.options && (
                      <div className="space-y-2 mt-3">
                        {question.options.map((option) => {
                          const isUserAnswer = userAnswer === option;
                          const isCorrectOption = question.correctAnswer === option;
                          return (
                            <div
                              key={option}
                              className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                                isCorrectOption
                                  ? "border-emerald-500/30 bg-emerald-500/5"
                                  : isUserAnswer && !isCorrectOption
                                  ? "border-destructive/30 bg-destructive/5"
                                  : "border-border"
                              }`}
                            >
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                isCorrectOption ? "border-emerald-500 bg-emerald-500/10" : isUserAnswer ? "border-destructive bg-destructive/10" : "border-border"
                              }`}>
                                {(isCorrectOption || isUserAnswer) && (
                                  <div className={`h-2 w-2 rounded-full ${isCorrectOption ? "bg-emerald-500" : "bg-destructive"}`} />
                                )}
                              </div>
                              <span className={isCorrectOption ? "text-emerald-600 dark:text-emerald-400 font-medium" : isUserAnswer ? "text-destructive" : ""}>
                                {option}
                              </span>
                              {isCorrectOption && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
                              {isUserAnswer && !isCorrectOption && <AlertCircle className="ml-auto h-4 w-4 text-destructive" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.type === "fill-blank" && (
                      <div className="mt-3 space-y-2">
                        <div className={`rounded-xl border p-3 text-sm ${
                          isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"
                        }`}>
                          <p className="text-muted-foreground">Your answer: <span className="font-medium text-foreground">{String(userAnswer || "—")}</span></p>
                          {!isCorrect && (
                            <p className="text-emerald-600 dark:text-emerald-400 mt-1">Correct answer: <span className="font-medium">{question.correctAnswer}</span></p>
                          )}
                        </div>
                      </div>
                    )}

                    {question.type === "descriptive" && (
                      <div className="mt-3 rounded-xl border border-border bg-background/50 p-3 text-sm">
                        <p className="text-muted-foreground">Your answer:</p>
                        <p className="mt-1 whitespace-pre-wrap text-foreground">{String(userAnswer || "—")}</p>
                        {question.correctAnswer && (
                          <div className="mt-3 border-t border-border pt-3">
                            <p className="text-muted-foreground">Model answer:</p>
                            <p className="mt-1 text-foreground">{question.correctAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {question.explanation && (
                      <div className="mt-3 rounded-xl bg-primary/5 border border-primary/10 p-3 text-sm text-muted-foreground">
                        <span className="font-medium text-primary">Explanation:</span> {question.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingAttempt(null)}
                className="btn-primary"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submit Modal */}
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Submit Assessment?"
        description="Are you sure you want to submit? You won't be able to change your answers after submission."
        confirmLabel="Submit Assessment"
        onConfirm={handleConfirmSubmit}
        loading={busy !== ""}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Assessments Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Assessments</h2>
          </div>

          {assessments.length === 0 ? (
            <EmptyState
              icon={FileQuestion}
              title="No assessments"
              description="No assessments have been published for this course yet."
            />
          ) : (
            assessments.map((item) => {
              const attemptsUsed = item.attempts.length;
              const canAttempt = attemptsUsed < item.attemptLimit;
              const latestAttempt = item.attempts.at(-1);

              return (
                <article key={item.id} className="glass-card p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {attemptsUsed}/{item.attemptLimit} attempts
                    </span>
                  </div>

                  {/* Questions */}
                  <div className="mt-4 space-y-4">
                    {item.questions.map((question) => (
                      <fieldset key={question.id} className="rounded-xl border border-border bg-background/30 p-4">
                        <legend className="text-sm font-medium px-2">
                          {question.prompt} <span className="text-muted-foreground">({question.points} pt{question.points !== 1 ? "s" : ""})</span>
                        </legend>

                        {question.type === "mcq-single" && question.options?.map((option) => (
                          <label key={option} className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-muted/30 transition-colors">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={() => setAnswers({ ...answers, [question.id]: option })}
                              disabled={!canAttempt}
                              className="accent-primary"
                            />
                            <span>{option}</span>
                          </label>
                        ))}

                        {question.type === "mcq-multiple" && question.options?.map((option) => {
                          const selected = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : [];
                          return (
                            <label key={option} className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-muted/30 transition-colors">
                              <input
                                type="checkbox"
                                value={option}
                                checked={selected.includes(option)}
                                onChange={() => {
                                  const current = selected;
                                  const next = current.includes(option)
                                    ? current.filter((v) => v !== option)
                                    : [...current, option];
                                  setAnswers({ ...answers, [question.id]: next });
                                }}
                                disabled={!canAttempt}
                                className="accent-primary"
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}

                        {question.type === "fill-blank" && (
                          <input
                            type="text"
                            value={(answers[question.id] as string) || ""}
                            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                            placeholder="Your answer..."
                            disabled={!canAttempt}
                            className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        )}

                        {question.type === "descriptive" && (
                          <textarea
                            value={(answers[question.id] as string) || ""}
                            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                            placeholder="Write your answer here..."
                            disabled={!canAttempt}
                            className="mt-2 min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                          />
                        )}
                      </fieldset>
                    ))}
                  </div>

                  {/* Attempts & Actions */}
                  <div className="mt-5 space-y-3">
                    {latestAttempt && (
                      <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Latest score:</span>
                          <span className="font-bold text-primary">{latestAttempt.score ?? "Pending"}</span>
                          {latestAttempt.passed !== undefined && (
                            <span className={latestAttempt.passed ? "text-emerald-500" : "text-destructive"}>
                              · {latestAttempt.passed ? "Passed" : "Not passed"}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewingAttempt({ assessment: item, attempt: latestAttempt })}
                          className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                        >
                          <Eye className="h-3.5 w-3.5" /> Review
                        </button>
                      </div>
                    )}

                    {canAttempt ? (
                      <button
                        type="button"
                        className="btn-primary flex items-center gap-2"
                        disabled={busy === item.id}
                        onClick={() => submitAssessment(item)}
                      >
                        {busy === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {busy === item.id ? "Submitting..." : "Submit Assessment"}
                      </button>
                    ) : (
                      <p className="text-xs text-muted-foreground">All attempts used.</p>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Assignments Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-secondary" />
            <h2 className="font-display text-xl font-semibold">Assignments</h2>
          </div>

          {assignments.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No assignments"
              description="No assignments have been published for this course yet."
            />
          ) : (
            assignments.map((item) => {
              const submission = item.submissions[0];
              const isGraded = submission?.status === "graded";
              const isOverdue = item.dueAt && new Date(item.dueAt) < new Date();

              return (
                <article key={item.id} className="glass-card p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
                      {item.maxPoints} pts
                    </span>
                  </div>

                  {item.dueAt && (
                    <div className={`flex items-center gap-2 text-xs mb-4 ${isOverdue && !submission ? "text-destructive" : "text-muted-foreground"}`}>
                      <Clock className="h-3.5 w-3.5" />
                      Due: {new Date(item.dueAt).toLocaleString()}
                      {isOverdue && !submission && <span className="font-semibold">(Overdue)</span>}
                    </div>
                  )}

                  {isGraded && submission ? (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Graded</span>
                      </div>
                      <p className="font-medium">Score: {submission.score}/{item.maxPoints}</p>
                      {submission.feedback && (
                        <p className="mt-2 text-muted-foreground">Feedback: {submission.feedback}</p>
                      )}
                    </div>
                  ) : submission ? (
                    <div className="rounded-xl bg-muted/40 p-4 text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-amber-400" />
                        <span className="font-medium">Submitted · Awaiting grading</span>
                      </div>
                      {submission.text && (
                        <p className="mt-1 text-muted-foreground line-clamp-3">{submission.text}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <label className="block text-sm font-medium mb-2">Your response</label>
                      <textarea
                        className="min-h-32 w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                        value={drafts[item.id] ?? ""}
                        onChange={(event) => setDrafts({ ...drafts, [item.id]: event.target.value })}
                        placeholder="Write your assignment response here..."
                      />
                      <button
                        type="button"
                        className="btn-primary mt-4 flex items-center gap-2"
                        disabled={busy === item.id || !drafts[item.id]?.trim()}
                        onClick={() => submitAssignment(item)}
                      >
                        {busy === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {busy === item.id ? "Submitting..." : "Submit Assignment"}
                      </button>
                    </>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
