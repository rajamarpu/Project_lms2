import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Heart, Menu, X, LayoutGrid, Shield, Settings } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/learning-paths", label: "Learning Paths" },
  { to: "/community", label: "Community" },
  { to: "/live-sessions", label: "Live" },
  { to: "/ai-tutors", label: "AI Tutors" },
  { to: "/questions", label: "Practice" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/certificates", label: "Certificates" },
  { to: "/wishlist", label: "Saved" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isStaff = user?.role === "admin";
  const isInstructor = user?.role === "instructor" || isStaff;
  const hiddenForStaff = ["/certificates", "/dashboard", "/learning-paths"];
  const filteredLinks = links.filter(l => !(isStaff && hiddenForStaff.includes(l.to)));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2">Skip to content</a>
      <div className="container flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/logo.webp" alt="UptoSkills Logo" className="h-10 w-auto" />
        </NavLink>

        <nav className="hidden lg:flex items-center gap-5">
          {filteredLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {/* Portal link — admins only */}
          {isInstructor && (
            <NavLink
              to="/portal"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive ? "text-primary" : "text-primary/70 hover:text-primary"
                }`
              }
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Portal
            </NavLink>
          )}
          
          {/* Admin Portal link */}
          {isStaff && (
            <a
              href={import.meta.env.VITE_ADMIN_URL || "http://localhost:3001/admin-login"}
              className="text-sm font-medium transition-colors flex items-center gap-1.5 text-destructive/80 hover:text-destructive"
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </a>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <NavLink to="/notifications" aria-label="Notifications" className="text-muted-foreground hover:text-primary"><Bell className="h-4 w-4" /></NavLink>
              <NavLink to="/wishlist" aria-label="Saved courses" className="text-muted-foreground hover:text-primary"><Heart className="h-4 w-4" /></NavLink>
              <NavLink to="/settings" aria-label="Settings" className="text-muted-foreground hover:text-primary"><Settings className="h-4 w-4" /></NavLink>
              <NavLink to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                Hi, {user.name.split(" ")[0]}
              </NavLink>
              <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">Logout</button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </NavLink>
              <NavLink to="/register" className="btn-primary !py-2 !px-4 text-sm">
                Get Started
              </NavLink>
            </>
          )}
        </div>

        <button className="rounded-lg p-2 text-foreground lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div id="mobile-navigation" className="border-t border-border bg-background lg:hidden animate-fade-in">
          <div className="container py-4 flex flex-col gap-3">
            {filteredLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm py-2 ${isActive ? "text-primary" : "text-muted-foreground"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {isInstructor && (
              <NavLink
                to="/portal"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm py-2 flex items-center gap-1.5 ${isActive ? "text-primary" : "text-primary/70"}`
                }
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Portal
              </NavLink>
            )}
            {isStaff && (
              <a
                href={import.meta.env.VITE_ADMIN_URL || "http://localhost:3001/admin-login"}
                className="text-sm py-2 flex items-center gap-1.5 text-destructive/80"
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </a>
            )}
            <div className="border-t border-border my-2" />
            {isAuthenticated && user ? (
              <>
                <NavLink to="/notifications" onClick={() => setOpen(false)} className="text-sm py-2 text-muted-foreground">Notifications</NavLink>
                <NavLink to="/settings" onClick={() => setOpen(false)} className="text-sm py-2 text-muted-foreground">Settings</NavLink>
                <NavLink to="/profile" onClick={() => setOpen(false)} className="text-sm py-2 font-medium hover:text-primary transition-colors">
                  Hi, {user.name}
                </NavLink>
                <button 
                  onClick={() => { handleLogout(); setOpen(false); }}
                  className="text-sm py-2 text-left text-muted-foreground hover:text-foreground"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)} className="text-sm py-2 text-muted-foreground hover:text-primary">
                  Sign In
                </NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)} className="text-sm py-2 text-primary font-medium">
                  Get Started
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

