import { Link, useNavigate } from "react-router-dom";
import { Star, Users, School, TrendingUp, Clock, BookOpen, Heart, HeartOff, PlayCircle, Eye, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { platformApi } from "@/api/platform.api";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/utils/media";

const FALLBACK = "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

const levelStyles: Record<string, { bg: string; border: string; color: string }> = {
  Beginner: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', color: '#10B981' },
  Intermediate: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', color: '#3B82F6' },
  Advanced: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.35)', color: '#8B5CF6' },
  Expert: { bg: 'rgba(239,68,68,0.14)', border: 'rgba(239,68,68,0.32)', color: '#EF4444' },
};

export interface CourseView {
  id: string | number;
  title: string;
  category: string;
  level: string;
  thumbnail?: string;
  duration?: string;
  price?: number;
  rating?: number;
  progress?: number;
  celebrityTeacher?: string;
  instructor?: string | { name?: string; avatar?: string };
  lessons?: number | unknown[];
  enrollments?: number;
  _count?: { enrollments?: number };
  bookmarked?: boolean;
}

const Stat = ({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: string | number; accent: string }) => (
  <div className="rounded-2xl border border-border/50 bg-background/40 px-2 py-2 backdrop-blur-sm transition-colors hover:bg-background/80">
    <div className="flex items-center gap-1 mb-0.5">
      <Icon size={12} style={{ color: accent }} />
      <span className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</span>
    </div>
    <p className="text-sm font-bold text-foreground">{value}</p>
  </div>
);

export const CourseCard = ({ course, index = 0 }: { course: CourseView; index?: number }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [bookmarked, setBookmarked] = useState(Boolean(course.bookmarked));
  const [bookmarking, setBookmarking] = useState(false);
  const lvl = levelStyles[course.level] || levelStyles.Beginner;
  const thumbnail = !imgError && course.thumbnail ? resolveMediaUrl(course.thumbnail) : FALLBACK;

  const fullStars = Math.floor(course.rating || 0);
  const showProgress = course.progress !== undefined;
  const progressVal = course.progress ?? 0;

  useEffect(() => {
    setBookmarked(Boolean(course.bookmarked));
  }, [course.bookmarked, course.id]);

  const openDetails = () => {
    navigate(`/courses/${course.id}`);
  };

  const startLearning = () => {
    if (course.progress && course.progress > 0) {
      navigate(`/learn/${course.id}`);
      return;
    }

    navigate(`/courses/${course.id}?enroll=1`);
  };

  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setBookmarking(true);
    try {
      const { data } = await platformApi.toggleBookmark(String(course.id));
      const nextState = Boolean(data?.data?.bookmarked);
      setBookmarked(nextState);
      toast.success(nextState ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <div
      className="group block opacity-0 animate-fade-in relative h-full outline-none"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <article className="course-card flex h-full flex-col bg-card/68 backdrop-blur-md">
        <Link to={`/courses/${course.id}`} className="relative h-40 overflow-hidden shrink-0 bg-muted">
          <img
            src={thumbnail}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.08),rgba(2,6,23,0.72))]" />
          <img
            src={thumbnail}
            alt={course.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
            {course.category}
          </span>
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
            <Clock size={12} className="text-primary" />
            {course.duration || "Self-paced"}
          </div>
        </Link>

        <div className="flex flex-col flex-1 p-5 gap-3">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
              style={{ background: lvl.bg, borderColor: lvl.border, color: lvl.color }}
            >
              {course.level}
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              {course.price && course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
            </span>
          </div>

          <button
            type="button"
            onClick={openDetails}
            className="text-left text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300"
          >
            {course.title}
          </button>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground -mt-1">
            <School size={14} className="text-secondary shrink-0" />
            <span className="truncate">{typeof course.instructor === 'object' ? course.instructor?.name : (course.celebrityTeacher || course.instructor || "Expert Instructor")}</span>
          </p>

          <div className="flex items-center gap-0.5">
             {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < fullStars ? "fill-[#FBBF24] text-[#FBBF24]" : "fill-muted border-none text-muted"}
                />
             ))}
             <span className="ml-1 text-xs font-semibold text-[#FBBF24]">{course.rating ?? 0}</span>
             <span className="ml-2 text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen size={12} /> {Array.isArray(course.lessons) ? course.lessons.length : course.lessons || 0} lessons
             </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
            <Stat
              icon={Users}
              label="Enrolled"
              value={course._count?.enrollments ?? course.enrollments ?? 0}
              accent="#3B82F6"
            />
            <Stat
              icon={TrendingUp}
              label={showProgress ? "Progress" : "Level"}
              value={showProgress ? `${progressVal}%` : course.level}
              accent="#14B8A6"
            />
          </div>

          {showProgress && <div className="mt-1">
             <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden shadow-inner">
               <div
                 className="h-full rounded-full transition-all duration-1000 ease-out"
                 style={{
                   width: `${progressVal}%`,
                   background: "linear-gradient(90deg, #3B82F6, #14B8A6)",
                 }}
               />
             </div>
          </div>}

          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={openDetails}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/70 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/10"
            >
              <Eye size={13} />
              View Details
            </button>
            <button
              type="button"
              onClick={toggleBookmark}
              disabled={bookmarking}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/70 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 disabled:opacity-60"
            >
              {bookmarked ? <HeartOff size={13} /> : <Heart size={13} />}
              {bookmarked ? "Saved" : "Wishlist"}
            </button>
            <button
              type="button"
              onClick={startLearning}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/95"
            >
              <PlayCircle size={13} />
              {showProgress && progressVal > 0 ? "Continue" : "Enroll"}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
