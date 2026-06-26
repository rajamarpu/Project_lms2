import { Github, Twitter, Linkedin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="mt-20 border-t border-border bg-card/35">
    <div className="container py-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <img src="/logo.webp" alt="UptoSkills Logo" className="mb-4 h-9 w-auto" />
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            UptoSkills helps learners master in-demand skills through curated courses, structured paths,
            progress tracking, certificates, and real project momentum.
          </p>
          <Link to="/courses" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Explore the catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <h5 className="mb-3 font-medium">Learn</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/courses" className="hover:text-primary">Courses</Link></li>
            <li><Link to="/learning-paths" className="hover:text-primary">Learning Paths</Link></li>
            <li><Link to="/features" className="hover:text-primary">Platform Features</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-3 font-medium">Support</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/support" className="hover:text-primary">Help Center</Link></li>
            <li><Link to="/settings" className="hover:text-primary">Preferences</Link></li>
            <li><a href="mailto:support@uptoskills.com" className="hover:text-primary">support@uptoskills.com</a></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-3 font-medium">Connect</h5>
          <div className="mb-4 flex gap-3">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="UptoSkills on GitHub" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background/60 text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="UptoSkills on X" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background/60 text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="UptoSkills on LinkedIn" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background/60 text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
          </div>
          <p className="text-sm text-muted-foreground">Enterprise-ready learning experiences with the UptoSkills visual language.</p>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © 2026 UptoSkills. All rights reserved.
      </div>
    </div>
  </footer>
);
