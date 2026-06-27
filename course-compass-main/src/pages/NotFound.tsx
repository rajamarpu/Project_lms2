import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Compass, Home, LayoutDashboard, SearchX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="page-shell relative min-h-[calc(100vh-74px)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.18),transparent_30%),radial-gradient(circle_at_80%_18%,hsl(var(--secondary)/0.14),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]" />
      <div className="container relative flex min-h-[calc(100vh-74px)] items-center justify-center py-16">
        <section className="surface-card w-full max-w-4xl overflow-hidden rounded-[2.25rem] p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                <SearchX className="h-3.5 w-3.5" />
                Route unavailable
              </div>
              <h1 className="brand-heading mt-6 font-display text-4xl font-black tracking-tight sm:text-5xl">
                This page isn&apos;t part of your current learning route.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                We couldn&apos;t find <span className="font-semibold text-foreground">{location.pathname}</span>. The destination may have moved, the link may be outdated, or the page was never connected.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/" className="btn-primary">
                  Go home <Home className="h-4 w-4" />
                </Link>
                <Link to="/courses" className="btn-outline-teal">
                  Browse courses <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-5 py-3 text-sm font-bold transition hover:border-primary/30 hover:bg-background">
                  Open dashboard <LayoutDashboard className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Compass, title: "Learning paths", text: "Step back into structured roadmaps and skill tracks.", to: "/learning-paths" },
                { icon: LayoutDashboard, title: "Dashboard", text: "Resume activity, certificates, and account actions.", to: "/dashboard" },
                { icon: Home, title: "Homepage", text: "Return to the primary UptoSkills experience.", to: "/" },
                { icon: ArrowRight, title: "Support", text: "Need help with a broken link? Open the help center.", to: "/support" },
              ].map(({ icon: Icon, title, text, to }) => (
                <Link key={title} to={to} className="rounded-[1.6rem] border border-border bg-background/60 p-5 transition hover:border-primary/30 hover:bg-primary/5">
                  <Icon className="h-5 w-5 text-primary" />
                  <h2 className="mt-4 font-display text-lg font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotFound;
