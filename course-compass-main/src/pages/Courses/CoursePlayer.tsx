import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Lock,
  PlayCircle,
} from "lucide-react";
import { courseApi } from "@/api/course.api";
import { CourseFlashcards } from "@/components/common/CourseFlashcards";
import { useAuth } from "@/store/AuthContext";
import { toast } from "sonner";

type Lesson = { id: string; title: string; content?: string; videoUrl?: string; order: number };
type PlayerCourse = { id: string; title: string; lessons: Lesson[] };
type PlayerEnrollment = {
  progress: number;
  certificateApproved: boolean;
  mentor?: string;
  lastLessonId?: string;
  completedLessons: Array<{ id: string }>;
};

const mentors = ["Aisha Khan", "Rahul Verma", "Meera Iyer", "Arjun Patel", "Neha Sharma", "Virtual Mentor"];

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [course, setCourse] = useState<PlayerCourse | null>(null);
  const [enrollment, setEnrollment] = useState<PlayerEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [updatingMentor, setUpdatingMentor] = useState(false);

  const isEnrolled = user?.role === "admin" ? true : Boolean(enrollment);

  const fetchEnrollment = useCallback(async (): Promise<PlayerEnrollment | null> => {
    try {
      const res = await courseApi.getEnrollmentByCourse(id!);
      setEnrollment(res.data.data);
      return res.data.data;
    } catch {
      return null;
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const courseResponse = await courseApi.getCourseById(id!);
        const nextCourse = courseResponse.data.data as PlayerCourse;
        nextCourse.lessons = [...(nextCourse.lessons || [])].sort((a, b) => a.order - b.order);
        if (!active) return;
        setCourse(nextCourse);

        if (user?.role === "admin") {
          setEnrollment({
            progress: 100,
            certificateApproved: true,
            completedLessons: nextCourse.lessons.map((lesson) => ({ id: lesson.id })),
          });
        } else {
          const enr = await fetchEnrollment();
          if (!active) return;
          if (enr?.lastLessonId) {
            const resumeIndex = nextCourse.lessons.findIndex((lesson) => lesson.id === enr.lastLessonId);
            if (resumeIndex >= 0) setActiveLessonIndex(resumeIndex);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) void load();
    return () => {
      active = false;
    };
  }, [fetchEnrollment, id, user?.role]);

  const activeLesson = useMemo(() => course?.lessons?.[activeLessonIndex] ?? null, [activeLessonIndex, course]);
  const completedLessonIds = useMemo(
    () => new Set(enrollment?.completedLessons?.map((lesson) => lesson.id) || []),
    [enrollment?.completedLessons],
  );
  const isCurrentCompleted = Boolean(activeLesson?.id && completedLessonIds.has(activeLesson.id));
  const isFullyCompleted = enrollment?.progress === 100;

  const renderVideo = (url?: string) => {
    if (!url) return null;
    if (/\.(mp4|webm|ogg)$/i.test(url)) {
      return <video controls className="h-full w-full bg-black" src={url} />;
    }
    const embedUrl = url.includes("youtube.com/watch?v=")
      ? url.replace("watch?v=", "embed/")
      : url.includes("youtu.be/")
        ? url.replace("youtu.be/", "youtube.com/embed/")
        : url;
    return <iframe className="h-full w-full bg-black" src={embedUrl} title="Video player" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />;
  };

  const handleMarkComplete = async () => {
    if (!course || !activeLesson || !enrollment || isCurrentCompleted) return;
    try {
      setMarkingComplete(true);
      await courseApi.completeLesson(course.id, activeLesson.id);
      await fetchEnrollment();
      toast.success("Lesson marked complete.");
      if (activeLessonIndex < course.lessons.length - 1) {
        const nextIndex = activeLessonIndex + 1;
        setActiveLessonIndex(nextIndex);
        courseApi.updateResumePosition(course.id, course.lessons[nextIndex].id).catch(() => {});
      }
    } catch (err: unknown) {
      toast.error((axios.isAxiosError(err) && err.response?.data?.error) || "Failed to update lesson progress.");
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleMentorChange = async () => {
    if (!selectedMentor) return;
    try {
      setUpdatingMentor(true);
      await courseApi.updateEnrollmentMentor(id!, selectedMentor);
      setEnrollment((current) => (current ? { ...current, mentor: selectedMentor } : current));
      toast.success(`Mentor changed to ${selectedMentor}.`);
      setMentorOpen(false);
    } catch (err: unknown) {
      toast.error((axios.isAxiosError(err) && err.response?.data?.error) || "Failed to change mentor.");
    } finally {
      setUpdatingMentor(false);
    }
  };

  if (loading) {
    return (
      <div className="container grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return <Navigate to="/dashboard" replace />;

  if (!isEnrolled) {
    return (
      <div className="page-shell">
        <div className="surface-card mx-auto max-w-2xl py-14 text-center">
          <Lock className="mx-auto h-14 w-14 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold">Access denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">You must be enrolled to view this course content.</p>
          <Link to={`/courses/${id}`} className="btn-primary mt-6 inline-flex">
            View course details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-border bg-card px-4 py-2 text-sm">
            Progress: <span className="font-semibold text-primary">{enrollment?.progress || 0}%</span>
          </div>
          <Link to={`/courses/${id}/work`} className="btn-outline-teal">
            Course work
          </Link>
          {isFullyCompleted && enrollment?.certificateApproved && (
            <Link to={`/certificate/${id}`} className="btn-primary">
              <Award className="h-4 w-4" />
              View certificate
            </Link>
          )}
          {isFullyCompleted && !enrollment?.certificateApproved && (
            <div className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              <Clock className="mr-2 inline h-4 w-4" />
              Certificate pending approval
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="surface-card overflow-hidden p-0">
          <div className="aspect-video bg-muted">
            {activeLesson?.videoUrl ? (
              renderVideo(activeLesson.videoUrl)
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="mt-3 font-semibold">No video for this lesson</p>
                <p className="mt-1 text-sm text-muted-foreground">Read the lesson notes below to continue.</p>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="page-eyebrow">Lesson workspace</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">{activeLesson?.order}. {activeLesson?.title || course.title}</h1>
              </div>
              {isCurrentCompleted ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-2 text-xs font-semibold text-secondary">
                  <Check className="h-4 w-4" />
                  Completed
                </span>
              ) : null}
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-muted/20 p-5">
              <p className="text-sm leading-7 brand-body whitespace-pre-wrap">
                {activeLesson?.content || "No additional notes provided for this lesson."}
              </p>
            </div>

            <CourseFlashcards courseId={course.id} courseTitle={course.title} />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Lesson {activeLessonIndex + 1} of {course.lessons.length}
              </p>
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={isCurrentCompleted || markingComplete}
                className={isCurrentCompleted ? "rounded-xl border border-secondary/20 bg-secondary/10 px-5 py-3 text-sm font-semibold text-secondary" : "btn-primary"}
              >
                {markingComplete ? <Loader2 className="h-4 w-4 animate-spin" /> : isCurrentCompleted ? <Check className="h-4 w-4" /> : null}
                {isCurrentCompleted ? "Completed" : "Mark as complete"}
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {enrollment && (
            <div className="surface-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Your mentor</p>
                  <h2 className="mt-1 text-lg font-semibold">{enrollment.mentor || "Virtual Mentor"}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMentor(enrollment.mentor || "Virtual Mentor");
                    setMentorOpen(true);
                  }}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          <div className="surface-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Course content</p>
                <h2 className="mt-1 text-lg font-semibold">{course.lessons.length} lessons</h2>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {course.lessons.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No lessons available yet.
                </p>
              ) : (
                course.lessons.map((lesson, index) => {
                  const isActive = activeLessonIndex === index;
                  const completed = completedLessonIds.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => {
                        setActiveLessonIndex(index);
                        if (user?.role !== "admin") {
                          courseApi.updateResumePosition(id!, lesson.id).catch(() => {});
                        }
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive ? "border-primary/30 bg-primary/10" : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                          ) : isActive ? (
                            <PlayCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-border" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                            {lesson.order}. {lesson.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{lesson.videoUrl ? "Video lesson" : "Reading lesson"}</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="surface-card">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Learning reminders</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-secondary" />Progress is saved as you move through lessons</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-secondary" />Assignments live in the course work center</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-secondary" />Completion can unlock a verified certificate</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Need a different path? Return to the dashboard or switch courses from the catalog without losing your session.
      </div>

      {mentorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.5rem] border border-border bg-card p-6 shadow-[var(--shadow-overlay)]">
            <h3 className="text-lg font-bold">Change mentor</h3>
            <p className="mt-2 text-sm text-muted-foreground">Pick the mentor who should guide this course experience.</p>
            <div className="mt-4">
              <select
                value={selectedMentor}
                onChange={(event) => setSelectedMentor(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3"
              >
                <option value="">Select a mentor</option>
                {mentors.map((mentor) => (
                  <option key={mentor} value={mentor}>
                    {mentor}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setMentorOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/60">
                Cancel
              </button>
              <button type="button" onClick={handleMentorChange} disabled={!selectedMentor || updatingMentor} className="btn-primary">
                {updatingMentor ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save mentor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
