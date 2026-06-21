import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Star, Clock, BookOpen, Users, Award, CheckCircle2, PlayCircle,
  Heart, HeartOff, Loader2
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

const tabs = ["About", "Outcomes", "Curriculum", "Instructors", "Reviews"] as const;
type Tab = typeof tabs[number];
type Lesson = { id: string; title: string; content?: string; order: number };
type Enrollment = { courseId: string; mentor?: string };
type CourseDetail = {
  id: string; title: string; description: string; category: string; level: string; thumbnail?: string;
  rating: number; duration?: string; price: number; outcomes: string[]; lessons: Lesson[];
  celebrityTeacher?: string; instructor?: { name: string }; instructors?: Array<{ name: string; role: string; avatar: string }>;
  _count?: { enrollments: number };
};
type Review = { id: string; rating: number; comment?: string; createdAt: string; user: { name: string; avatar?: string } };

// ---------------------------------------------------------------------------
// Wishlist helpers (localStorage)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isInstructorOrAdmin = user?.role === "admin";
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("About");

  // Enroll state
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  
  // Mentor Selection State
  const [mentorSelectionOpen, setMentorSelectionOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState("");
  const celebrities = ["Virat Kohli", "Salman Khan", "Narendra Modi", "Sachin Tendulkar", "Hardik Pandya", "Virtual Mentor"];

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  // -------------------------------------------------------------------------
  // Fetch course
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseApi.getCourseById(id!);
        setCourse(res.data.data);
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  useEffect(() => { if (id) platformApi.reviews(id).then(({ data }) => setReviews(data.data)).catch(() => {}); }, [id]);

  // -------------------------------------------------------------------------
  // Check enrollment & wishlist status once course + auth are ready
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    // Enrollment (backend)
    if (isAuthenticated) {
      platformApi.bookmarks().then(({ data }) => setIsWishlisted(data.data.some((bookmark: { courseId: string }) => bookmark.courseId === id))).catch(() => {});
      courseApi
        .getMyEnrollments()
        .then((res) => {
          const enrollment = res.data.data?.find((e: Enrollment) => e.courseId === id);
          if (enrollment) {
            setIsEnrolled(true);
            if (enrollment.mentor) {
               setCourse((prev) => prev ? ({
                  ...prev,
                  instructors: [{
                    name: enrollment.mentor,
                    role: "Lead Instructor",
                    avatar: "https://ui-avatars.com/api/?name=" + enrollment.mentor
                  }]
               }) : prev);
            }
          }
        })
        .catch(() => {});
    }
  }, [id, isAuthenticated]);

  // -------------------------------------------------------------------------
  // Enroll handler
  // -------------------------------------------------------------------------
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

  const proceedAfterMentorSelection = () => {
    setMentorSelectionOpen(false);
    if (course.price && course.price > 0) {
      toast({ title: "Purchase unavailable", description: "Paid enrollment is disabled until a verified payment provider is configured.", variant: "destructive" });
      return;
    }
    handleEnroll();
  };

  const handleEnroll = async () => {

    setEnrollLoading(true);
    try {
      await courseApi.enrollInCourse(id!, { mentor: selectedMentor });
      setIsEnrolled(true);
      if (selectedMentor) {
        setCourse((prev) => prev ? ({
            ...prev,
            instructors: [{
              name: selectedMentor,
              role: "Lead Instructor",
              avatar: "https://ui-avatars.com/api/?name=" + selectedMentor
            }]
        }) : prev);
      }
      toast({
        title: "Enrolled successfully! 🎉",
        description: "You are now enrolled. Head to your dashboard to start learning.",
      });
    } catch (err: unknown) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.error) || "Failed to enroll. Please try again.";
      toast({ title: "Enrollment failed", description: msg, variant: "destructive" });
    } finally {
      setEnrollLoading(false);
    }
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
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Action failed",
        description: "Could not unenroll from the course.",
        variant: "destructive",
      });
    } finally {
      setEnrollLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Wishlist handler
  // -------------------------------------------------------------------------
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

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await platformApi.submitReview(id!, reviewForm);
      const { data } = await platformApi.reviews(id!);
      setReviews(data.data);
      setReviewForm({ rating: 5, comment: "" });
      toast({ title: "Review saved" });
    } catch (error) {
      toast({ title: "Review unavailable", description: "Only enrolled learners can review this course.", variant: "destructive" });
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (isLoading)
    return (
      <div className="p-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  if (error || !course) return <Navigate to="/courses" replace />;

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img
            src={course.thumbnail}
            alt=""
            className="w-full h-full object-cover opacity-20 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative py-10">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to courses
          </Link>

          <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
            <div>
              <span className="inline-block text-xs font-mono px-2.5 py-1 rounded-md bg-secondary/20 text-secondary border border-secondary/40 mb-4">
                {course.category} · {course.level}
              </span>
              <h1 className="font-display font-bold text-3xl md:text-5xl mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-primary fill-primary" /> {course.rating} rating
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-4 h-4" /> {course._count?.enrollments || 0} enrolled
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" /> {course.duration || 'Self-paced'}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen className="w-4 h-4" /> {Array.isArray(course.lessons) ? course.lessons.length : course.lessons || 0} lessons
                </span>
              </div>
            </div>

            {/* ---- Enrollment Card ---- */}
            <div className="glass-card overflow-hidden lg:sticky lg:top-20">
              <div className="relative aspect-video">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                  <PlayCircle className="w-16 h-16 text-primary drop-shadow-lg" />
                </div>
              </div>
              <div className="p-6">
                <p className="text-3xl font-display font-bold mb-4">
                  {course.price && course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                  {course.price && course.price > 0 && (
                    <span className="text-sm text-muted-foreground line-through font-normal ml-2">
                      ${(course.price * 1.5).toFixed(2)}
                    </span>
                  )}
                  {!course.price && (
                    <span className="text-sm text-muted-foreground line-through font-normal ml-2">
                      $49.99
                    </span>
                  )}
                </p>

                {/* Show enroll/wishlist only for students (role === 'user' or not logged in) */}
                {isInstructorOrAdmin ? (
                  <div className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary text-center mb-4">
                    {user?.role === "admin"
                      ? "You are an admin. Enroll options are for students only."
                      : "Admins cannot enroll in courses."}
                  </div>
                ) : (
                  <>
                    {/* Enroll Button */}
                    <button
                      id="enroll-btn"
                      className="btn-primary w-full mb-3 flex items-center justify-center gap-2 disabled:opacity-60"
                      onClick={handleEnrollClick}
                      disabled={enrollLoading}
                    >
                      {enrollLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isEnrolled ? (
                        <>
                          <PlayCircle className="w-4 h-4" /> Go to Course Player
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </button>

                    {isEnrolled && (
                      <button
                        onClick={handleUnenroll}
                        disabled={enrollLoading}
                        className="w-full py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3 border border-transparent hover:border-destructive/20"
                      >
                        Drop Course
                      </button>
                    )}

                    {/* Wishlist Button */}
                    <button
                      id="wishlist-btn"
                      className="btn-outline-teal w-full flex items-center justify-center gap-2 disabled:opacity-60"
                      onClick={handleWishlist}
                      disabled={wishlistLoading}
                    >
                      {wishlistLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isWishlisted ? (
                        <>
                          <HeartOff className="w-4 h-4" /> Remove from Wishlist
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4" /> Add to Wishlist
                        </>
                      )}
                    </button>

                    {/* Mentor Selection Modal */}
                    <AlertDialog open={mentorSelectionOpen} onOpenChange={setMentorSelectionOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Choose Your AI Mentor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Select the celebrity you want as your AI teacher for this course.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Preferred Mentor</label>
                          <select
                            value={selectedMentor}
                            onChange={(e) => setSelectedMentor(e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          >
                            <option value="">Select a Mentor</option>
                            {celebrities.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={proceedAfterMentorSelection}
                            className="btn-primary"
                            disabled={!selectedMentor}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </>
                )}

                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-secondary" /> Certificate of completion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> Lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary" /> Community support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container py-10">
        <div className="lg:max-w-3xl">
          <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
            {tabs.filter(t => isEnrolled || t !== "Instructors").map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="animate-fade-in" key={tab}>
            {tab === "About" && (
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This course combines theory and practice — every module ends with a
                  hands-on project to cement your learning.
                </p>
              </div>
            )}
            {tab === "Outcomes" && (
              <ul className="grid md:grid-cols-2 gap-3">
                {(course.outcomes || []).map((o: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 glass-card p-4">
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{o}</span>
                  </li>
                ))}
              </ul>
            )}
            {tab === "Curriculum" && (
              <div className="space-y-3">
                {(Array.isArray(course.lessons) ? course.lessons : []).map((lesson, i: number) => (
                  <div key={lesson.id || i} className="glass-card p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-sm">{lesson.title}</h4>
                      {lesson.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lesson.content}</p>}
                    </div>
                    <PlayCircle className="w-5 h-5 text-secondary shrink-0" />
                  </div>
                ))}
                {(!course.lessons || course.lessons.length === 0) && (
                  <p className="text-muted-foreground text-sm text-center py-8">No lessons available yet. Check back soon!</p>
                )}
              </div>
            )}
            {tab === "Instructors" && (
              <div className="grid md:grid-cols-2 gap-4">
                {course.instructor && (
                  <div className="glass-card p-5 flex items-center gap-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.celebrityTeacher || course.instructor?.name || 'Instructor')}&background=8B5CF6&color=fff&bold=true`}
                      alt={course.instructor?.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-secondary"
                    />
                    <div>
                      <h4 className="font-display font-semibold">{course.celebrityTeacher || course.instructor?.name}</h4>
                      <p className="text-xs text-muted-foreground">Lead Instructor</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {tab === "Reviews" && (
              <div className="space-y-5">
                {isEnrolled && <form onSubmit={submitReview} className="glass-card space-y-4 p-5"><h3 className="font-display font-semibold">Share your experience</h3><label className="block text-sm font-medium">Rating<select className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3" value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })}>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></label><label className="block text-sm font-medium">Comment<textarea className="mt-2 min-h-24 w-full rounded-xl border border-border bg-background p-3" value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} /></label><button type="submit" className="btn-primary">Save review</button></form>}
                {reviews.length ? reviews.map((review) => <article key={review.id} className="glass-card p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{review.user.name}</h3><span className="text-sm font-semibold text-primary">{review.rating}/5</span></div>{review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}<time className="mt-2 block text-xs text-muted-foreground" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time></article>) : <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No reviews yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
