import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { platformApi } from "@/api/platform.api";
import { courseApi } from "@/api/course.api";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

const fallbackImage = "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

export default function Wishlist() {
  const [courses, setCourses] = useState<CourseView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await platformApi.bookmarks();
      const bookmarks = data.data || [];
      if (!bookmarks.length) {
        setCourses([]);
        return;
      }

      const courseIds = bookmarks.map((b: { courseId: string }) => b.courseId);
      const results = await Promise.all(
        courseIds.map((cid: string) =>
          courseApi.getCourseById(cid).then(({ data }) => data.data).catch(() => null)
        )
      );

      setCourses(
        results
          .filter(Boolean)
          .map((c: CourseView) => ({
            ...c,
            thumbnail: c.thumbnail || fallbackImage,
            level: c.level || "Beginner",
            rating: c.rating || 0,
            enrollments: c._count?.enrollments || 0,
            lessons: Array.isArray(c.lessons) ? c.lessons.length : Number(c.lessons || 0),
            instructor: c.celebrityTeacher || (typeof c.instructor === "object" ? c.instructor?.name : c.instructor) || "Instructor",
            bookmarked: true,
          }))
      );
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWishlist();
  }, [fetchWishlist]);

  useRefreshOnFocus(fetchWishlist, [fetchWishlist]);

  if (loading) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-shell container py-8 lg:py-10">
      <PageHeader
        icon={Heart}
        label="My Learning"
        title="Wishlist"
        description="Courses you've saved for later. Pick up right where your interest left off."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved courses yet"
          description="Browse the catalog and save courses you want to take later."
          actionLabel="Explore courses"
          actionTo="/courses"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
