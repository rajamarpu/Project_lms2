import { Link } from "react-router-dom";
import { Award, Calendar, ExternalLink, Download } from "lucide-react";

interface CertificateCardProps {
  id: string;
  verificationId: string;
  courseId: string;
  courseTitle: string;
  issuedAt?: string;
}

export function CertificateCard({ verificationId, courseId, courseTitle, issuedAt }: CertificateCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
      <div className="relative flex aspect-[1.4] flex-col items-center justify-center overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background" />
        <Award className="relative z-10 mb-3 h-12 w-12 text-primary drop-shadow-sm" />
        <h4 className="relative z-10 font-display text-lg font-bold leading-tight text-foreground">{courseTitle}</h4>
        <p className="relative z-10 mt-2 font-mono text-xs text-muted-foreground">ID: {verificationId}</p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-1 font-semibold" title={courseTitle}>{courseTitle}</h3>
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Issued: {issuedAt ? new Date(issuedAt).toLocaleDateString() : "Pending"}</span>
        </div>
        <div className="mt-auto flex gap-2">
          <Link
            to={`/certificate/${courseId}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            View <ExternalLink className="h-4 w-4" />
          </Link>
          <Link
            to={`/certificate/${courseId}`}
            className="flex items-center justify-center rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Download className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}