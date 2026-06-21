import { Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border mt-20 py-10 bg-card/30">
    <div className="container grid md:grid-cols-4 gap-8">
      <div>
        <img src="/logo.webp" alt="UptoSkills Logo" className="h-8 w-auto mb-3" />
        <p className="text-sm text-muted-foreground">Master in-demand skills with curated courses & live projects.</p>
      </div>
      <div>
        <h5 className="font-medium mb-3">Learn</h5>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li><Link to="/courses" className="hover:text-primary">Courses</Link></li><li><Link to="/learning-paths" className="hover:text-primary">Learning Paths</Link></li><li><Link to="/features" className="hover:text-primary">Platform Features</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="font-medium mb-3">Company</h5>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li><Link to="/features" className="hover:text-primary">About UptoSkills</Link></li><li><Link to="/support" className="hover:text-primary">Help Center</Link></li><li><a href="mailto:support@uptoskills.com" className="hover:text-primary">Contact</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-medium mb-3">Connect</h5>
        <div className="flex gap-3">
          <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="UptoSkills on GitHub"><Github className="w-5 h-5 text-muted-foreground hover:text-primary" /></a>
          <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="UptoSkills on X"><Twitter className="w-5 h-5 text-muted-foreground hover:text-primary" /></a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="UptoSkills on LinkedIn"><Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary" /></a>
        </div>
      </div>
    </div>
    <div className="container mt-8 pt-6 border-t border-border text-xs text-muted-foreground text-center">
      © 2026 UpToSkills. All rights reserved.
    </div>
  </footer>
);
