import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="page-shell flex min-h-[70vh] items-center">
      <section className="surface-card mx-auto max-w-2xl text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-8 w-8" />
        </div>
        <p className="page-eyebrow mx-auto mt-5 w-fit">Route not found</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">We could not find that page.</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The link may be outdated, mistyped, or no longer available in this workspace.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Return home
          </Link>
          <Link to="/courses" className="btn-outline-teal">
            Browse courses
          </Link>
        </div>
      </section>
    </div>
  );
}
