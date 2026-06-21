import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { platformApi } from "@/api/platform.api";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";

type Bookmark = { id: string; courseId: string; course: CourseView };

export default function Wishlist() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await platformApi.bookmarks();
      setItems(data.data || []);
    } catch {
      setError("Your saved courses could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <div className="page-shell">
    <header className="mb-10">
      <p className="page-eyebrow">Your learning shortlist</p>
      <h1 className="page-title">Saved courses</h1>
      <p className="page-description">Keep promising courses close and return when you are ready to learn.</p>
    </header>
    {loading ? <div className="grid min-h-64 place-items-center" role="status"><div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm text-muted-foreground">Loading saved courses…</p></div></div>
      : error ? <div className="surface-card text-center" role="alert"><p>{error}</p><button type="button" onClick={load} className="btn-primary mt-5"><RefreshCw className="h-4 w-4" />Retry</button></div>
      : items.length ? <section aria-label="Saved courses" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{items.map((item, index) => <CourseCard key={item.id} index={index} course={item.course} />)}</section>
      : <section className="surface-card py-14 text-center"><Heart className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-xl font-bold">Nothing saved yet</h2><p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Use “Add to Wishlist” on a course page to build a shortlist.</p><Link to="/courses" className="btn-primary mt-6">Browse courses</Link></section>}
  </div>;
}
