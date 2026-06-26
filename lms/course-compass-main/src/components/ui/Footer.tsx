import { Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="uptoskills-footer mt-20 border-t border-border py-12">
    <div className="container grid gap-8 md:grid-cols-4">
      <div>
        <img src="/logo.webp" alt="UptoSkills Logo" className="mb-3 h-8 w-auto" />
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          Master in-demand skills through structured courses, practical work, and verified outcomes.
        </p>
      </div>
      <div>
        <h5 className="mb-3 font-bold brand-subheading">Learn</h5>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/courses" className="hover:text-primary">Courses</Link></li>
          <li><Link to="/learning-paths" className="hover:text-primary">Learning Paths</Link></li>
          <li><Link to="/dashboard" className="hover:text-primary">Learner Dashboard</Link></li>
          <li><Link to="/certificates" className="hover:text-primary">Certificates</Link></li>
          <li><Link to="/features" className="hover:text-primary">Platform Features</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="mb-3 font-bold brand-subheading">Company</h5>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/features" className="hover:text-primary">About UptoSkills</Link></li>
          <li><Link to="/support" className="hover:text-primary">Help Center</Link></li>
          <li><Link to="/notifications" className="hover:text-primary">Notifications</Link></li>
          <li><a href="mailto:support@uptoskills.com" className="hover:text-primary">Contact</a></li>
        </ul>
      </div>
      <div>
        <h5 className="mb-3 font-bold brand-subheading">Connect</h5>
        <div className="flex gap-3">
          <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="UptoSkills on GitHub">
            <Github className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="UptoSkills on X">
            <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="UptoSkills on LinkedIn">
            <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </a>
        </div>
      </div>
    </div>
    <div className="container mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
      © 2026 UptoSkills. All rights reserved.
    </div>
  </footer>
);
