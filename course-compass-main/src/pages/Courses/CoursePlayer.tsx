import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  FileText,
  CheckCircle,
  Loader2,
  ChevronRight,
  Lock,
  Award,
  Check,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
} from "lucide-react";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";
import { toast } from "sonner";

type Lesson = { id: string; title: string; content?: string; videoUrl?: string; order: number };
type PlayerCourse = { id: string; title: string; lessons: Lesson[] };
type PlayerEnrollment = { progress: number; certificateApproved: boolean; mentor?: string; lastLessonId?: string; completedLessons: Array<{ id: string }> };

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [course, setCourse] = useState<PlayerCourse | null>(null);
  const [enrollment, setEnrollment] = useState<PlayerEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mentorChangeOpen, setMentorChangeOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [updatingMentor, setUpdatingMentor] = useState(false);
  const [lessonNotes, setLessonNotes] = useState("");
  const celebrities = ["Virat Kohli", "Salman Khan", "Narendra Modi", "Sachin Tendulkar", "Hardik Pandya", "Virtual Mentor"];
  const activeLesson = course?.lessons?.[activeLessonIndex];
  const activeLessonResources = Array.isArray((activeLesson as Lesson & { resources?: Array<{ label?: string; url: string }> } | undefined)?.resources)
    ? ((activeLesson as Lesson & { resources?: Array<{ label?: string; url: string }> }).resources || [])
    : [];
  const activeLessonCaptionsUrl = (activeLesson as (Lesson & { captionsUrl?: string }) | undefined)?.captionsUrl || "";
  const lessonStorageKey = `uptoskills-notes:${id}:${activeLesson?.id || "lesson"}`;

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
    const fetchData = async () => {
      try {
        const courseRes = await courseApi.getCourseById(id!);
        const c = courseRes.data.data;
        c.lessons = [...(c.lessons || [])].sort((a: Lesson, b: Lesson) => a.order - b.order);
        setCourse(c);

        if (user?.role === "admin") {
          setIsEnrolled(true);
        } else {
          const enr = await fetchEnrollment();
          setIsEnrolled(!!enr);
          if (enr?.lastLessonId) {
            const resumeIndex = c.lessons.findIndex((lesson: { id: string }) => lesson.id === enr.lastLessonId);
            if (resumeIndex >= 0) setActiveLessonIndex(resumeIndex);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [fetchEnrollment, id, user]);

  const handleMarkComplete = async () => {
    if (!enrollment || !activeLesson) return;

    try {
      setIsMarkingComplete(true);
      await courseApi.completeLesson(id!, activeLesson.id);
      await fetchEnrollment();
      toast.success("Lesson marked as complete!");

      if (activeLessonIndex < (course?.lessons.length || 0) - 1) {
        const nextIndex = activeLessonIndex + 1;
        setActiveLessonIndex(nextIndex);
        courseApi.updateResumePosition(id!, course!.lessons[nextIndex].id).catch(() => {});
      }
    } catch (err: unknown) {
      toast.error((axios.isAxiosError(err) && err.response?.data?.error) || "Failed to mark lesson as complete");
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const goToLesson = (index: number) => {
    setActiveLessonIndex(index);
    setShowSidebar(false);
    if (user?.role !== "admin" && course) {
      courseApi.updateResumePosition(id!, course.lessons[index].id).catch(() => {});
    }
  };

  const handleMentorChange = async () => {
    if (!selectedMentor) return;
    try {
      setUpdatingMentor(true);
      await courseApi.updateEnrollmentMentor(id!, selectedMentor);
      setEnrollment((prev) => prev ? { ...prev, mentor: selectedMentor } : prev);
      toast.success(`Mentor changed to ${selectedMentor}!`);
      setMentorChangeOpen(false);
    } catch (err: unknown) {
      toast.error((axios.isAxiosError(err) && err.response?.data?.error) || "Failed to change mentor");
    } finally {
      setUpdatingMentor(false);
    }
  };

  useEffect(() => {
    if (!activeLesson?.id || typeof window === "undefined") return;
    setLessonNotes(window.localStorage.getItem(lessonStorageKey) || "");
  }, [activeLesson?.id, lessonStorageKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return <Navigate to="/dashboard" replace />;

  if (!isEnrolled) {
    return (
      <div className="container py-20 text-center">
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="font-display font-bold text-2xl mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You must be enrolled to view this course's content.</p>
        <Link to={`/courses/${id}`} className="btn-primary inline-flex items-center gap-2">
          View Course Details
        </Link>
      </div>
    );
  }

  const completedLessonIds = new Set(enrollment?.completedLessons?.map((lesson) => lesson.id) || []);
  const isCurrentCompleted = completedLessonIds.has(activeLesson?.id);
  const isFullyCompleted = enrollment?.progress === 100;
  const completedCount = completedLessonIds.size;
  const totalLessons = course.lessons.length;
  const saveLessonNotes = () => {
    if (typeof window === "undefined" || !activeLesson?.id) return;
    window.localStorage.setItem(lessonStorageKey, lessonNotes);
    toast.success("Notes saved locally");
  };

  const renderVideo = (url?: string) => {
    if (!url) return null;

    if (url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm") || url.toLowerCase().endsWith(".ogg")) {
      return (
        <video controls className="w-full h-full bg-black" src={url}>
          Your browser does not support the video tag.
        </video>
      );
    }

    let embedUrl = url;
    if (url.includes("youtube.com/watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be/")) {
      embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
    }

    return (
      <iframe
        className="w-full h-full bg-black"
        src={embedUrl}
        title="Video Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background border-t border-border">
      {/* Top Bar */}
      <div className="h-14 sm:h-16 border-b border-border flex items-center px-4 sm:px-6 shrink-0 bg-muted/10 gap-3">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="hidden sm:block h-6 w-px bg-border" />
        <h1 className="font-display font-semibold truncate flex-1 text-sm sm:text-base">{course.title}</h1>

        {enrollment && (
          <div className="hidden sm:flex items-center gap-4">
            <Link to={`/courses/${id}/work`} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
              Course work
            </Link>
            <div className="text-sm font-medium">
              Progress: <span className="text-primary">{enrollment.progress}%</span>
            </div>
            {isFullyCompleted && enrollment.certificateApproved && (
              <Link to={`/certificate/${id}`} className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-2">
                <Award className="w-4 h-4" /> Certificate
              </Link>
            )}
            {isFullyCompleted && !enrollment.certificateApproved && (
              <div className="bg-muted/50 border border-border text-muted-foreground px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pending Approval
              </div>
            )}
          </div>
        )}

        {/* Mobile sidebar toggle */}
        <button
          type="button"
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Progress Bar */}
      {enrollment && (
        <div className="h-1 bg-muted/50 shrink-0">
          <div
            className="h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${enrollment.progress}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>
        {/* Left: Player Area */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-black/5 relative pb-20">
          {/* Video Container */}
          <div className="w-full aspect-video bg-black flex items-center justify-center relative shrink-0">
            {activeLesson?.videoUrl ? (
              renderVideo(activeLesson.videoUrl)
            ) : (
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No video available for this lesson.</p>
                <p className="text-xs mt-1 opacity-70">Please read the content below.</p>
              </div>
            )}
          </div>

          {/* Lesson Content */}
          <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto w-full flex-1 mb-20">
            <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl mb-2 flex items-center gap-3">
                  {activeLesson?.order}. {activeLesson?.title || "Welcome"}
                  {isCurrentCompleted && (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-500" title="Completed">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {/* Mobile progress info */}
            <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground sm:hidden">
              <span>Lesson {activeLessonIndex + 1} of {totalLessons}</span>
              <span>{completedCount}/{totalLessons} completed</span>
            </div>

            <div className="max-w-none text-foreground/90 leading-7">
              {activeLesson?.content ? (
                <div className="whitespace-pre-wrap">{activeLesson.content}</div>
              ) : (
                <p className="italic text-muted-foreground">No additional notes provided for this lesson.</p>
              )}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">Lesson notes</h3>
                    <p className="text-xs text-muted-foreground">Saved on this device for quick revision.</p>
                  </div>
                  <button
                    type="button"
                    onClick={saveLessonNotes}
                    className="rounded-xl border border-border bg-background/80 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/10"
                  >
                    Save notes
                  </button>
                </div>
                <textarea
                  value={lessonNotes}
                  onChange={(event) => setLessonNotes(event.target.value)}
                  placeholder="Write key takeaways, reminders, or questions here..."
                  className="min-h-[140px] w-full rounded-2xl border border-border bg-background/70 p-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
                <h3 className="font-semibold text-foreground">Lesson resources</h3>
                <p className="mt-1 text-xs text-muted-foreground">Files, captions, and downloads attached by the course team appear here.</p>
                <div className="mt-4 space-y-3">
                  {activeLessonResources.length > 0 ? (
                    activeLessonResources.map((resource, index) => (
                      <a
                        key={`${resource.url}-${index}`}
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4 text-primary" />
                        <span className="min-w-0 flex-1 truncate">{resource.label || `Resource ${index + 1}`}</span>
                      </a>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
                      No downloads attached to this lesson.
                    </div>
                  )}
                  {activeLessonCaptionsUrl && (
                    <a
                      href={activeLessonCaptionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm transition-colors hover:border-secondary/30 hover:bg-secondary/10"
                    >
                      <FileText className="h-4 w-4 text-secondary" />
                      <span className="min-w-0 flex-1 truncate">Captions / subtitles</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => goToLesson(activeLessonIndex - 1)}
                disabled={activeLessonIndex === 0}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              <button
                type="button"
                onClick={() => goToLesson(activeLessonIndex + 1)}
                disabled={activeLessonIndex >= totalLessons - 1}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Footer */}
          {enrollment && activeLesson && (
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-background border-t border-border flex justify-between items-center shadow-lg">
              <div className="text-sm text-muted-foreground hidden sm:block">
                Lesson {activeLessonIndex + 1} of {totalLessons}
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <Link
                  to={`/courses/${id}/work`}
                  className="hidden sm:flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Course work
                </Link>
                <button
                  onClick={handleMarkComplete}
                  disabled={isCurrentCompleted || isMarkingComplete}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    isCurrentCompleted
                      ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                      : "btn-primary shadow-md hover:shadow-lg"
                  }`}
                >
                  {isMarkingComplete ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                  {isCurrentCompleted ? "Completed" : "Mark as Complete"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar Syllabus */}
        <div className={`w-full lg:w-[350px] border-l border-border bg-muted/5 flex flex-col shrink-0 h-full ${showSidebar ? "fixed inset-0 z-50 lg:relative lg:z-auto" : "hidden lg:flex"}`}>
          {/* Mobile close button */}
          <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
            <h3 className="font-display font-bold">Course Content</h3>
            <button type="button" onClick={() => setShowSidebar(false)} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {enrollment && (
            <div className="p-4 sm:p-5 border-b border-border shrink-0 bg-primary/5">
              <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Your Celebrity Mentor</h4>
              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.mentor || "Virtual Mentor")}&background=8B5CF6&color=fff&bold=true`}
                  alt={enrollment.mentor || "Virtual Mentor"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{enrollment.mentor || "Virtual Mentor"}</p>
                  <p className="text-xs text-muted-foreground">Personalized Guide</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMentor(enrollment.mentor || "Virtual Mentor");
                    setMentorChangeOpen(true);
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Mobile progress */}
          {enrollment && (
            <div className="px-4 py-3 border-b border-border lg:hidden">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-primary">{enrollment.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted/70">
                <div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${enrollment.progress}%` }} />
              </div>
            </div>
          )}

          <div className="p-4 sm:p-5 border-b border-border shrink-0">
            <h3 className="font-display font-bold text-lg mb-1">Course Content</h3>
            <p className="text-xs text-muted-foreground">{completedCount}/{totalLessons} completed · {course.lessons.length} lessons</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5">
            {course.lessons.length === 0 ? (
              <div className="text-center p-6 text-sm text-muted-foreground">
                No lessons available yet.
              </div>
            ) : (
              course.lessons.map((lesson, i: number) => {
                const isActive = activeLessonIndex === i;
                const isCompleted = completedLessonIds.has(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => goToLesson(i)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                      isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/40 border border-transparent"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isActive ? (
                        <PlayCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight mb-1 ${
                        isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {lesson.order}. {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {lesson.videoUrl ? "Video" : "Article"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mentor Change Modal */}
      {mentorChangeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
            <h3 className="text-lg font-bold font-display mb-2 text-foreground">Change Celebrity Mentor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select the celebrity you want to guide you through this course.
            </p>

            <div className="py-4">
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Choose Mentor</label>
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
              >
                <option value="">Select a Mentor</option>
                {celebrities.map((c) => (
                  <option key={c} value={c} className="bg-background text-foreground">{c}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setMentorChangeOpen(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl transition-colors"
                disabled={updatingMentor}
              >
                Cancel
              </button>
              <button
                onClick={handleMentorChange}
                disabled={!selectedMentor || updatingMentor}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/95 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
              >
                {updatingMentor && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
