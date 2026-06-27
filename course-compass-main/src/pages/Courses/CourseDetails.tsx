import { useParams, Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  Star,
  Clock,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  PlayCircle,
  Heart,
  HeartOff,
  Loader2,
  Sparkles,
  Target,
  BadgeCheck,
  Layers3,
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
import { useAuth } from "@/store/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { platformApi } from "@/api/platform.api";
import axios from "axios";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { resolveMediaUrl } from "@/utils/media";

const tabs = ["About", "Outcomes", "Curriculum", "Instructors", "Reviews"] as const;
type Tab = typeof tabs[number];
type Lesson = { id: string; title: string; content?: string; order: number };
type Enrollment = { courseId: string; mentor?: string };
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
  instructor?: { id?: string; name: string; avatar?: string };
  instructors?: Array<{ name: string; role: string; avatar?: string }>;
  _count?: { enrollments: number };
};
type Review = { id: string; rating: number; comment?: string; createdAt: string; user: { name: string; avatar?: string } };

const mentorOptions = ["Virat Kohli", "Salman Khan", "Narendra Modi", "Sachin Tendulkar", "Hardik Pandya", "Virtual Mentor"];

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const isInstructorOrAdmin = user?.role === "admin";
  const { toast } = useToast();
  const autoEnrollTriggered = useRef(false);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("About");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [mentorSelectionOpen, setMentorSelectionOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const loadCourse = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await courseApi.getCourseById(id);
      setCourse(res.data.data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await platformApi.reviews(id);
      setReviews(data.data);
    } catch {
      // ignore transient review load failures
    }
  }, [id]);

  const loadEnrollmentState = useCallback(async () => {
    if (!id || !isAuthenticated) return;

    try {
      const [bookmarkRes, enrollmentRes] = await Promise.all([
        platformApi.bookmarks(),
        courseApi.getMyEnrollments(),
      ]);

      setIsWishlisted(bookmarkRes.data.data.some((bookmark: { courseId: string }) => bookmark.courseId === id));

      const enrollment = enrollmentRes.data.data?.find((e: Enrollment) => e.courseId === id);
      setIsEnrolled(Boolean(enrollment));
      if (enrollment?.mentor) {
        setSelectedMentor(enrollment.mentor);
      }
    } catch {
      // ignore transient enrollment load failures
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (tab !== "Reviews") return;
    void loadReviews();
  }, [loadReviews, tab]);

  useEffect(() => {
    void loadEnrollmentState();
  }, [loadEnrollmentState]);

  useRefreshOnFocus(() => {
    void loadCourse();
    if (tab === "Reviews") {
      void loadReviews();
    }
    void loadEnrollmentState();
  }, [loadCourse, loadReviews, loadEnrollmentState, tab]);

  const learningObjectives = useMemo(() => {
    if (!course) return [];
    return (course.outcomes?.length ? course.outcomes : [
      "Build confidence through guided lessons and practical exercises",
      "Apply concepts to realistic learner workflows and projects",
      "Track progress with milestones that keep momentum visible",
    ]).slice(0, 6);
  }, [course]);

  const prerequisites = useMemo(() => {
    if (!course) return [];
    return [
      `Comfort with ${course.category?.toLowerCase() || "digital learning"} basics`,
      "A willingness to practice with guided projects",
      "Roughly 4 to 6 focused hours each week",
    ];
  }, [course]);

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to enroll in this course.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${id}`);
      return;
    }

    setMentorSelectionOpen(true);
  };

  const handleEnroll = async () => {
    setEnrollLoading(true);
    try {
      await courseApi.enrollInCourse(id!, { mentor: selectedMentor });
      setIsEnrolled(true);
      setSelectedMentor(selectedMentor);
      toast({
        title: "Enrolled successfully!",
        description: "You are now enrolled. Head to your dashboard to start learning.",
      });
    } catch (err: unknown) {
      const msg = (axios.isAxiosError(err) && err.response?.data?.error) || "Failed to enroll. Please try again.";
      toast({ title: "Enrollment failed", description: msg, variant: "destructive" });
    } finally {
      setEnrollLoading(false);
    }
  };

  const proceedAfterMentorSelection = () => {
    setMentorSelectionOpen(false);
    if (course?.price && course.price > 0) {
      toast({ title: "Purchase unavailable", description: "Paid enrollment is disabled until a verified payment provider is configured.", variant: "destructive" });
      return;
    }
    handleEnroll();
  };

  const handleUnenroll = async () => {
    try {
      setEnrollLoading(true);
      await courseApi.unenrollFromCourse(id!);
      toast({
        title: "Unenrolled",
        description: "You have been removed from this course.",
      });
      setIsEnrolled(false);
      setSelectedMentor("");
      navigate("/dashboard");
    } catch {
      toast({
        title: "Action failed",
        description: "Could not unenroll from the course.",
        variant: "destructive",
      });
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to save courses to your wishlist.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      const { data } = await platformApi.toggleBookmark(id!);
      setIsWishlisted(data.data.bookmarked);
      toast({ title: data.data.bookmarked ? "Added to Wishlist" : "Removed from Wishlist" });
    } catch {
      toast({ title: "Wishlist update failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    const shouldAutoEnroll = searchParams.get("enroll") === "1";
    if (!shouldAutoEnroll || autoEnrollTriggered.current || !course || isLoading) return;

    if (isAuthenticated && !isEnrolled && !isInstructorOrAdmin) {
      autoEnrollTriggered.current = true;
      handleEnrollClick();
    }
  }, [course, handleEnrollClick, isAuthenticated, isEnrolled, isInstructorOrAdmin, isLoading, searchParams]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await platformApi.submitReview(id!, reviewForm);
      const { data } = await platformApi.reviews(id!);
      setReviews(data.data);
      setReviewForm({ rating: 5, comment: "" });
      toast({ title: "Review saved" });
    } catch {
      toast({ title: "Review unavailable", description: "Only enrolled learners can review this course.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !course) return <Navigate to="/courses" replace />;

  return (
    <div className="page-shell">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img src={resolveMediaUrl(course.thumbnail)} alt="" className="h-full w-full object-cover opacity-20 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative py-10">
          <Link to="/courses" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </Link>

          <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px]">
            <div>
              <span className="mb-4 inline-block rounded-md border border-secondary/40 bg-secondary/20 px-2.5 py-1 text-xs font-mono text-secondary">
                {course.category} · {course.level}
              </span>
              <h1 className="mb-4 font-display text-3xl font-bold md:text-5xl">{course.title}</h1>
              <p className="mb-6 text-lg text-muted-foreground">{course.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-primary text-primary" /> {course.rating} rating
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" /> {course._count?.enrollments || 0} enrolled
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {course.duration || "Self-paced"}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen className="h-4 w-4" /> {Array.isArray(course.lessons) ? course.lessons.length : course.lessons || 0} lessons
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <Target className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Completion time</p>
                  <p className="mt-1 font-semibold">{course.duration || "Self-paced"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <Layers3 className="h-5 w-5 text-secondary" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Roadmap</p>
                  <p className="mt-1 font-semibold">{Array.isArray(course.lessons) ? course.lessons.length : 0} structured lessons</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Outcomes</p>
                  <p className="mt-1 font-semibold">{learningObjectives.length} measurable goals</p>
                </div>
              </div>
            </div>

            <div className="glass-card overflow-hidden lg:sticky lg:top-20">
              <div className="relative aspect-video bg-slate-950/90">
                <img src={resolveMediaUrl(course.thumbnail)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl" />
                <img src={resolveMediaUrl(course.thumbnail)} alt={course.title} className="relative h-full w-full object-contain p-3" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                  <PlayCircle className="h-16 w-16 text-primary drop-shadow-lg" />
                </div>
              </div>
              <div className="p-6">
                <p className="mb-4 text-3xl font-display font-bold">
                  {course.price && course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                  {course.price && course.price > 0 ? (
                    <span className="ml-2 text-sm font-normal text-muted-foreground line-through">${(course.price * 1.5).toFixed(2)}</span>
                  ) : (
                    <span className="ml-2 text-sm font-normal text-muted-foreground line-through">$49.99</span>
                  )}
                </p>

                {isInstructorOrAdmin ? (
                  <div className="mb-4 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-center text-sm text-secondary">
                    {user?.role === "admin" ? "You are an admin. Enroll options are for students only." : "Admins cannot enroll in courses."}
                  </div>
                ) : (
                  <>
                    <button
                      id="enroll-btn"
                      className="btn-primary mb-3 flex w-full items-center justify-center gap-2 disabled:opacity-60"
                      onClick={handleEnrollClick}
                      disabled={enrollLoading}
                    >
                      {enrollLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isEnrolled ? (
                        <>
                          <PlayCircle className="h-4 w-4" /> Go to Course Player
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </button>

                    {isEnrolled && (
                      <button
                        onClick={handleUnenroll}
                        disabled={enrollLoading}
                        className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-transparent py-2 text-sm text-destructive transition-colors hover:border-destructive/20 hover:bg-destructive/10"
                      >
                        Drop Course
                      </button>
                    )}

                    <button
                      id="wishlist-btn"
                      className="btn-outline-teal flex w-full items-center justify-center gap-2 disabled:opacity-60"
                      onClick={handleWishlist}
                      disabled={wishlistLoading}
                    >
                      {wishlistLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isWishlisted ? (
                        <>
                          <HeartOff className="h-4 w-4" /> Remove from Wishlist
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4" /> Add to Wishlist
                        </>
                      )}
                    </button>

                    <AlertDialog open={mentorSelectionOpen} onOpenChange={setMentorSelectionOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Choose Your AI Mentor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Select the celebrity you want as your AI teacher for this course.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <label className="mb-1.5 block text-sm font-medium text-foreground/80">Preferred Mentor</label>
                          <select
                            value={selectedMentor}
                            onChange={(e) => setSelectedMentor(e.target.value)}
                            className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="">Select a Mentor</option>
                            {mentorOptions.map((mentor) => <option key={mentor} value={mentor}>{mentor}</option>)}
                          </select>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={proceedAfterMentorSelection} className="btn-primary" disabled={!selectedMentor}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Award className="h-4 w-4 text-secondary" /> Certificate of completion</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Lifetime access</li>
                  <li className="flex items-center gap-2"><Users className="h-4 w-4 text-secondary" /> Community support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="lg:max-w-3xl">
            <div className="mb-8 flex gap-1 overflow-x-auto border-b border-border">
              {tabs.filter((currentTab) => isEnrolled || currentTab !== "Instructors").map((currentTab) => (
                <button
                  key={currentTab}
                  onClick={() => setTab(currentTab)}
                  className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                    tab === currentTab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {currentTab}
                </button>
              ))}
            </div>

            <div className="animate-fade-in" key={tab}>
              {tab === "About" && (
                <div className="max-w-none space-y-4 leading-7">
                  <p className="text-foreground/90">{course.description}</p>
                  <p className="text-muted-foreground">
                    This course combines theory and practice - every module ends with a hands-on project to cement your learning.
                  </p>
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card/60 p-5">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">What you will learn</h3>
                      </div>
                      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                        {learningObjectives.slice(0, 3).map((item) => (
                          <li key={item} className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-card/60 p-5">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-secondary" />
                        <h3 className="font-semibold">Before you start</h3>
                      </div>
                      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                        {prerequisites.map((item) => (
                          <li key={item} className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {tab === "Outcomes" && (
                <ul className="grid gap-3 md:grid-cols-2">
                  {learningObjectives.map((item, index) => (
                    <li key={`${item}-${index}`} className="glass-card flex items-start gap-3 p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {tab === "Curriculum" && (
                <div className="space-y-3">
                  {(Array.isArray(course.lessons) ? course.lessons : []).map((lesson, index) => (
                    <div key={lesson.id || index} className="glass-card flex items-center gap-4 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-sm font-semibold">{lesson.title}</h4>
                        {lesson.content && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{lesson.content}</p>}
                      </div>
                      <PlayCircle className="h-5 w-5 shrink-0 text-secondary" />
                    </div>
                  ))}
                  {(!course.lessons || course.lessons.length === 0) && (
                    <p className="py-8 text-center text-sm text-muted-foreground">No lessons available yet. Check back soon!</p>
                  )}
                </div>
              )}

              {tab === "Instructors" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {course.instructor && (
                    <div className="glass-card flex items-center gap-4 p-5">
                      <img
                        src={resolveMediaUrl(course.instructor?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.celebrityTeacher || course.instructor?.name || "Instructor")}&background=8B5CF6&color=fff&bold=true`}
                        alt={course.instructor?.name}
                        className="h-16 w-16 rounded-full border-2 border-secondary object-cover"
                      />
                      <div>
                        <h4 className="font-display font-semibold">{course.celebrityTeacher || course.instructor?.name}</h4>
                        <p className="text-xs text-muted-foreground">Lead Instructor</p>
                      </div>
                    </div>
                  )}
                  {selectedMentor && (
                    <div className="glass-card flex items-center gap-4 p-5">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMentor)}&background=0F766E&color=fff&bold=true`}
                        alt={selectedMentor}
                        className="h-16 w-16 rounded-full border-2 border-primary object-cover"
                      />
                      <div>
                        <h4 className="font-display font-semibold">{selectedMentor}</h4>
                        <p className="text-xs text-muted-foreground">AI Mentor Companion</p>
                      </div>
                    </div>
                  )}
                  {!course.instructor && !selectedMentor && (
                    <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      Instructor details will appear here once the course team is assigned.
                    </p>
                  )}
                </div>
              )}

              {tab === "Reviews" && (
                <div className="space-y-5">
                  {isEnrolled && (
                    <form onSubmit={submitReview} className="glass-card space-y-4 p-5">
                      <h3 className="font-display font-semibold">Share your experience</h3>
                      <label className="block text-sm font-medium">
                        Rating
                        <select
                          className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3"
                          value={reviewForm.rating}
                          onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })}
                        >
                          {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                        </select>
                      </label>
                      <label className="block text-sm font-medium">
                        Comment
                        <textarea
                          className="mt-2 min-h-24 w-full rounded-xl border border-border bg-background p-3"
                          value={reviewForm.comment}
                          onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                        />
                      </label>
                      <button type="submit" className="btn-primary">Save review</button>
                    </form>
                  )}
                  {reviews.length ? reviews.map((review) => (
                    <article key={review.id} className="glass-card p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">{review.user.name}</h3>
                        <span className="text-sm font-semibold text-primary">{review.rating}/5</span>
                      </div>
                      {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                      <time className="mt-2 block text-xs text-muted-foreground" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time>
                    </article>
                  )) : (
                    <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No reviews yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <h3 className="font-semibold">Course snapshot</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3"><span>Difficulty</span><span className="font-medium text-foreground">{course.level}</span></div>
                <div className="flex items-center justify-between gap-3"><span>Format</span><span className="font-medium text-foreground">Self-paced</span></div>
                <div className="flex items-center justify-between gap-3"><span>Certificate</span><span className="font-medium text-foreground">Included</span></div>
                <div className="flex items-center justify-between gap-3"><span>Community</span><span className="font-medium text-foreground">Available</span></div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <h3 className="font-semibold">Learning objectives</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {learningObjectives.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
