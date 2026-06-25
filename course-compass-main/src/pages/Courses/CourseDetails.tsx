import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Heart,
  HeartOff,
  Loader2,
  PlayCircle,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { courseApi } from "@/api/course.api";
import { platformApi } from "@/api/platform.api";
import { useAuth } from "@/store/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/utils/apiError";

type Lesson = { id: string; title: string; content?: string; order: number; videoUrl?: string };
type CourseDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail?: string;
  rating: number;
  duration?: string;
  price: number;
  outcomes: string[];
  lessons: Lesson[];
  celebrityTeacher?: string;
  instructor?: { name: string };
  instructors?: Array<{ name: string; role: string; avatar: string }>;
  _count?: { enrollments: number };
};
type Review = { id: string; rating: number; comment?: string; createdAt: string; user: { name: string; avatar?: string } };
type Enrollment = { courseId: string; mentor?: string };

const tabs = ["About", "Outcomes", "Curriculum", "Instructors", "Reviews"] as const;
type Tab = (typeof tabs)[number];

const mentors = ["Aisha Khan", "Rahul Verma", "Meera Iyer", "Arjun Patel", "Neha Sharma", "Virtual Mentor"];

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const isStaff = user?.role === "admin" || user?.role === "instructor";

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("About");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [courseResponse, reviewResponse] = await Promise.all([
          courseApi.getCourseById(id!),
          platformApi.reviews(id!),
        ]);
        if (!active) return;
        setCourse(courseResponse.data.data);
        setReviews(reviewResponse.data.data || []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) void load();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    let active = true;
    courseApi
      .getMyEnrollments()
      .then((response) => {
        if (!active) return;
        const enrollment = (response.data.data || []).find((item: Enrollment) => item.courseId === id);
        setEnrolled(Boolean(enrollment));
      })
      .catch(() => {});

    platformApi
      .bookmarks()
      .then(({ data }) => {
        if (!active) return;
        setIsWishlisted((data.data || []).some((bookmark: { courseId: string }) => String(bookmark.courseId) === String(id)));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

  const stats = useMemo(
    () => [
      { icon: Star, label: "Rating", value: course?.rating ? course.rating.toFixed(1) : "4.9" },
      { icon: Users, label: "Learners", value: course?._count?.enrollments ?? 0 },
      { icon: Clock, label: "Duration", value: course?.duration || "Self-paced" },
      { icon: BookOpen, label: "Lessons", value: Array.isArray(course?.lessons) ? course.lessons.length : 0 },
    ],
    [course],
  );

  const handleEnroll = async () => {
    if (!id || !course) return;
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Sign in to enroll in this course.", variant: "destructive" });
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    if (isStaff) {
      toast({ title: "Instructor access", description: "Instructors and admins manage content from the portal." });
      return;
    }

    if (enrolled) {
      navigate(`/learn/${id}`);
      return;
    }

    setMentorOpen(true);
  };

  const confirmEnroll = async () => {
    if (!id || !course) return;
    if (course.price && course.price > 0) {
      toast({
        title: "Paid enrollment not configured",
        description: "This course is currently free-only in the learner portal.",
        variant: "destructive",
      });
      return;
    }

    setEnrollLoading(true);
    try {
      await courseApi.enrollInCourse(id, { mentor: selectedMentor });
      setEnrolled(true);
      toast({ title: "Enrolled successfully", description: "You can now continue learning from your dashboard." });
      setMentorOpen(false);
    } catch (err) {
      toast({
        title: "Enrollment failed",
        description: apiErrorMessage(err, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Sign in to save courses to your wishlist.", variant: "destructive" });
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    setWishLoading(true);
    try {
      const { data } = await platformApi.toggleBookmark(id);
      setIsWishlisted(Boolean(data.data?.bookmarked));
      toast({ title: data.data?.bookmarked ? "Added to saved courses" : "Removed from saved courses" });
    } catch (err) {
      toast({ title: "Wishlist update failed", description: apiErrorMessage(err, "Please try again."), variant: "destructive" });
    } finally {
      setWishLoading(false);
    }
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    try {
      await platformApi.submitReview(id, reviewForm);
      const { data } = await platformApi.reviews(id);
      setReviews(data.data || []);
      setReviewForm({ rating: 5, comment: "" });
      toast({ title: "Review saved" });
    } catch (err) {
      toast({
        title: "Review unavailable",
        description: apiErrorMessage(err, "Only enrolled learners can review this course."),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container grid min-h-[55vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="page-shell">
      <section className="portal-hero relative overflow-hidden rounded-[2rem] border border-border p-6 shadow-[var(--shadow-overlay)] md:p-8">
        <div className="absolute inset-0 opacity-90" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to courses
            </Link>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="h-4 w-4" />
              {course.category} · {course.level}
            </div>

            <h1 className="brand-heading mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">{course.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 brand-body md:text-base">{course.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-border bg-card/85 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
                  </div>
                  <p className="mt-1 text-lg font-extrabold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button type="button" onClick={handleEnroll} className="btn-primary">
              {enrolled ? "Continue learning" : "Enroll now"}
            </button>
            <button
              type="button"
              onClick={handleWishlist}
              disabled={wishLoading}
              className="btn-outline-teal"
            >
              {wishLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isWishlisted ? (
                <HeartOff className="h-4 w-4" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
              {isWishlisted ? "Saved" : "Save course"}
            </button>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="space-y-6">
          <div className="surface-card">
            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="pt-6">
              {activeTab === "About" && (
                <div className="space-y-4">
                  <p className="text-sm leading-6 brand-body">
                    This course is structured for real delivery: clear lessons, guided learning flow, assessment-ready outcomes, and a completion path that feels like a genuine LMS.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(course.outcomes || []).slice(0, 4).map((outcome) => (
                      <div key={outcome} className="flex items-start gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-secondary" />
                        <p className="text-sm leading-6">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Outcomes" && (
                <div className="grid gap-3 md:grid-cols-2">
                  {(course.outcomes || []).map((outcome) => (
                    <div key={outcome} className="rounded-2xl border border-border bg-card p-4">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <p className="mt-3 text-sm leading-6">{outcome}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Curriculum" && (
                <div className="space-y-3">
                  {(course.lessons || []).map((lesson, index) => (
                    <article key={lesson.id} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{lesson.content || "Lesson content is available after enrollment."}</p>
                      </div>
                      <PlayCircle className="h-5 w-5 shrink-0 text-primary/70" />
                    </article>
                  ))}
                  {(!course.lessons || course.lessons.length === 0) && (
                    <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      Curriculum will appear once the course is published with lessons.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "Instructors" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {(course.instructors?.length ? course.instructors : course.instructor ? [
                    { name: course.instructor.name, role: "Lead Instructor", avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=10b9a8&color=fff&bold=true` },
                  ] : []).map((instructor) => (
                    <article key={instructor.name} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                      <img
                        src={instructor.avatar}
                        alt={instructor.name}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{instructor.name}</h3>
                        <p className="text-sm text-muted-foreground">{instructor.role}</p>
                      </div>
                    </article>
                  ))}
                  {!course.instructor && !course.instructors?.length && (
                    <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      Instructor details are not yet configured for this course.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "Reviews" && (
                <div className="space-y-5">
                  {isAuthenticated && enrolled && !isStaff && (
                    <form onSubmit={submitReview} className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="font-semibold">Share your review</h3>
                      <label className="mt-4 block text-sm font-medium">
                        Rating
                        <select
                          className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3"
                          value={reviewForm.rating}
                          onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })}
                        >
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating} stars
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="mt-4 block text-sm font-medium">
                        Comment
                        <textarea
                          className="mt-2 min-h-28 w-full rounded-xl border border-border bg-background p-3"
                          value={reviewForm.comment}
                          onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                        />
                      </label>
                      <button type="submit" className="btn-primary mt-4">
                        Save review
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {reviews.length ? (
                      reviews.map((review) => (
                        <article key={review.id} className="rounded-2xl border border-border bg-card p-5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold">{review.user.name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                              {review.rating}/5
                            </span>
                          </div>
                          {review.comment && <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.comment}</p>}
                        </article>
                      ))
                    ) : (
                      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        No reviews yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card overflow-hidden p-0">
            <div className="relative aspect-[16/10] bg-muted">
              <img src={course.thumbnail || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80"} alt={course.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Enrollment</p>
                  <p className="mt-1 text-2xl font-extrabold text-foreground">{course.price > 0 ? `₹${course.price.toFixed(2)}` : "Free"}</p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{course._count?.enrollments || 0} learners enrolled</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <span>Certificate of completion included</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Self-paced with progress tracking</span>
                </div>
              </div>

              {isStaff ? (
                <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4 text-sm text-secondary">
                  Staff members can manage this course from the portal and still inspect the learner experience here.
                </div>
              ) : (
                <button type="button" onClick={handleEnroll} className="btn-primary w-full">
                  {enrolled ? "Open course player" : "Start learning"}
                </button>
              )}
            </div>
          </div>

          <div className="surface-card">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Included in this course</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-secondary" />Progress tracking across lessons</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-secondary" />Assignments and assessments</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-secondary" />Certificate verification flow</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-secondary" />Saved courses and reminders</li>
            </ul>
          </div>
        </aside>
      </div>

      <AlertDialog open={mentorOpen} onOpenChange={setMentorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose your mentor</AlertDialogTitle>
            <AlertDialogDescription>
              Select a mentor to personalize the learning experience for this course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
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
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEnroll} className="btn-primary" disabled={enrollLoading}>
              {enrollLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
