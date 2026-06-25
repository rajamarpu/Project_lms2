import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, BadgeCheck, ExternalLink, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { platformApi } from "@/api/platform.api";
import { useAuth } from "@/store/AuthContext";

export const CertificatesList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Array<{ id: string; verificationId: string; issuedAt?: string; courseId: string; course: { title: string } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await platformApi.certificates();
        setCertificates(res.data?.data || []);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      void load();
    } else {
      setLoading(false);
    }
  }, [user]);

  const stats = useMemo(
    () => [
      { value: certificates.length, label: "Verified certificates", icon: Award },
      { value: "Public", label: "Verification mode", icon: ShieldCheck },
      { value: "PDF", label: "Export format", icon: BadgeCheck },
    ],
    [certificates.length],
  );

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="portal-hero relative overflow-hidden rounded-[2rem] border border-border p-6 shadow-[var(--shadow-overlay)] md:p-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Certificates
            </div>
            <h1 className="brand-heading mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">Verified proof of learning, ready to share.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 brand-body md:text-base">
              View completed credentials, open certificate details, and keep your earned outcomes in one place.
            </p>
          </div>
          <Link to="/courses" className="btn-outline-teal">
            Explore courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-2xl font-extrabold text-foreground">{value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {!user ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
          <p className="mb-4 text-xl font-medium">Please log in to view your certificates.</p>
          <Link to="/login" className="btn-primary inline-flex">
            Log in
          </Link>
        </div>
      ) : certificates.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
          <Award className="mx-auto mb-6 h-16 w-16 text-muted-foreground/30" />
          <h3 className="mb-2 text-2xl font-semibold">No certificates yet</h3>
          <p className="mb-8 text-muted-foreground">
            Complete an eligible course to earn your first credential.
          </p>
          <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
            Explore courses
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <article key={cert.id} className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/30">
              <div className="relative aspect-[1.35] overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 text-center">
                <Award className="mx-auto mb-3 h-12 w-12 text-primary" />
                <h4 className="relative z-10 text-lg font-bold leading-tight text-foreground">{cert.course.title}</h4>
                <p className="relative z-10 mt-2 text-xs font-mono text-muted-foreground">ID: {cert.verificationId}</p>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 line-clamp-1 text-lg font-semibold" title={cert.course.title}>
                  {cert.course.title}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Issued: {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "Pending"}
                </p>
                <Link
                  to={`/certificate/${cert.courseId}`}
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  View certificate
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesList;
