import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Award, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { platformApi } from "@/api/platform.api";

type Verification = { verificationId: string; learner: string; course: string; issuedAt: string; expiresAt?: string };

export default function VerifyCertificate() {
  const { verificationId } = useParams<{ verificationId: string }>();
  const [data, setData] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    platformApi
      .verifyCertificate(verificationId!)
      .then(({ data: response }) => setData(response.data))
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false));
  }, [verificationId]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Verifying certificate</span>
      </div>
    );
  }

  return (
    <div className="page-shell flex min-h-[70vh] items-center">
      <article className="surface-card mx-auto w-full max-w-2xl overflow-hidden p-0">
        <div className="bg-gradient-to-r from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          {invalid || !data ? (
            <>
              <ShieldX className="mx-auto h-14 w-14 text-destructive" />
              <h1 className="mt-4 text-center text-3xl font-bold">Certificate not valid</h1>
              <p className="mt-3 text-center text-muted-foreground">
                This credential does not exist, has not been issued, or was revoked.
              </p>
            </>
          ) : (
            <>
              <ShieldCheck className="mx-auto h-14 w-14 text-secondary" />
              <Award className="mx-auto mt-4 h-8 w-8 text-primary" />
              <h1 className="mt-3 text-center text-3xl font-bold">Verified certificate</h1>
              <p className="mt-5 text-center text-lg">
                <strong>{data.learner}</strong> completed <strong>{data.course}</strong>.
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">Issued {new Date(data.issuedAt).toLocaleDateString()}</p>
              <p className="mt-1 text-center font-mono text-xs text-muted-foreground">{data.verificationId}</p>
            </>
          )}
        </div>

        <div className="grid gap-3 border-t border-border p-6 md:grid-cols-3">
          <Link to="/courses" className="btn-primary inline-flex justify-center">
            Explore courses
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/dashboard" className="btn-outline-teal inline-flex justify-center">
            Learner dashboard
          </Link>
          <Link to="/certificates" className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/50">
            My certificates
          </Link>
        </div>
      </article>
    </div>
  );
}
