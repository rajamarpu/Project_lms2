import { Link } from "react-router-dom";
import { Star, Users, School, Clock, BookOpen, type LucideIcon } from "lucide-react";
import { useState } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

const levelStyles: Record<string, { token: string }> = {
  Beginner: { token: '--status-success' },
  Intermediate: { token: '--status-info' },
  Advanced: { token: '--secondary' },
  Expert: { token: '--status-warning' },
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
  instructor?: string | { name?: string };
  lessons?: number | unknown[];
  enrollments?: number;
  _count?: { enrollments?: number };
}

const Stat = ({ icon: Icon, label, value, token }: { icon: LucideIcon; label: string; value: string | number; token: string }) => (
  <div className="rounded-2xl border border-border/60 bg-background/55 px-3 py-2 transition-colors hover:bg-background/80">
    <div className="flex items-center gap-1 mb-0.5">
      <Icon size={12} style={{ color: `hsl(var(${token}))` }} />
      <span className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</span>
    </div>
    <p className="text-sm font-bold text-foreground">{value}</p>
  </div>
);

export const CourseCard = ({ course, index = 0 }: { course: CourseView; index?: number }) => {
  const [imgError, setImgError] = useState(false);
  const lvl = levelStyles[course.level] || levelStyles.Beginner;
  const thumbnail = !imgError && course.thumbnail ? course.thumbnail : FALLBACK;

  const fullStars = Math.floor(course.rating || 0);
  const showProgress = course.progress !== undefined;
  const progressVal = course.progress ?? 0;
  const priceLabel = course.price && course.price > 0 ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(course.price) : 'Free';
  const lessonsCount = Array.isArray(course.lessons) ? course.lessons.length : Number(course.lessons || 0);
  const instructorName = typeof course.instructor === 'object' ? course.instructor?.name : (course.celebrityTeacher || course.instructor || "Expert Instructor");

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block opacity-0 animate-fade-in relative h-full outline-none"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <article className="course-card flex h-full flex-col bg-card/70 backdrop-blur-md">
        <div className="relative h-44 shrink-0 overflow-hidden bg-muted">
          <img
            src={thumbnail}
            alt={course.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
            {course.category}
          </span>
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
            <Clock size={12} className="text-primary" />
            {course.duration || `${lessonsCount} lessons`}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <span
              className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold"
              style={{ background: `hsl(var(${lvl.token}) / .12)`, borderColor: `hsl(var(${lvl.token}) / .38)`, color: `hsl(var(${lvl.token}))` }}
            >
              {course.level}
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              {priceLabel}
            </span>
          </div>

          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
            {course.title}
          </h3>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground -mt-1">
            <School size={14} className="text-secondary shrink-0" />
            <span className="truncate">{instructorName}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < fullStars ? "text-foreground" : "fill-muted border-none text-muted"}
                  style={i < fullStars ? { fill: 'hsl(var(--status-warning))', color: 'hsl(var(--status-warning))' } : undefined}
                />
              ))}
              <span>{course.rating?.toFixed(1)}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <BookOpen size={12} />
              {lessonsCount} lessons
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Users size={12} />
              {course._count?.enrollments ?? course.enrollments ?? 0} learners
            </span>
          </div>

          {showProgress ? (
            <div className="mt-auto pt-2">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Continue learning</span>
                <span className="font-semibold text-foreground">{progressVal}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/60 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${progressVal}%`,
                    background: `linear-gradient(90deg, hsl(var(--secondary)), hsl(var(--primary)))`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
              <Stat icon={Users} label="Enrolled" value={course._count?.enrollments ?? course.enrollments ?? 0} token="--secondary" />
              <Stat icon={Clock} label="Pace" value={course.duration || course.level} token="--primary" />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};
