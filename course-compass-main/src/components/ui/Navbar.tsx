import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Menu, X, LayoutGrid, Shield, Moon, Sun, Settings2, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { useTheme } from "@/context/ThemeProvider";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
];
const learnerLinks = [
  { to: "/dashboard", label: "Overview" },
  { to: "/courses", label: "Explore Courses" },
  { to: "/learning-paths", label: "Learning Paths" },
  { to: "/wishlist", label: "Saved" },
  { to: "/community", label: "Community" },
  { to: "/certificates", label: "Certificates" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isStaff = user?.role === "admin";
  const isInstructor = user?.role === "instructor" || isStaff;
  const hiddenForStaff = ["/certificates", "/dashboard", "/learning-paths"];
  const links = isAuthenticated ? learnerLinks : publicLinks;
  const filteredLinks = links.filter(l => !(isStaff && hiddenForStaff.includes(l.to)));
  const activeActionClass = "rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary";

  return (
    <header className="uptoskills-header sticky top-0 z-50 border-b border-border backdrop-blur-xl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2">Skip to content</a>
      <div className="container flex h-16 items-center justify-between gap-3 min-w-0">
        <NavLink to="/" className="flex items-center gap-2 rounded-xl focus-visible:ring-2 focus-visible:ring-primary">
          <img src="/logo.webp" alt="UptoSkills Logo" className="h-10 w-auto object-contain" />
        </NavLink>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:gap-2 lg:flex">
          {filteredLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `relative min-w-0 max-w-[11rem] truncate rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${isActive ? "bg-primary/10 text-primary after:absolute after:inset-x-2 after:-bottom-2.5 after:h-0.5 after:rounded-full after:bg-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`
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
                `flex min-w-0 max-w-[10rem] items-center gap-1.5 truncate rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-primary/75 hover:bg-muted/60 hover:text-primary"
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
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-primary">{resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <NavLink to="/notifications" aria-label="Notifications" className={activeActionClass}><Bell className="h-4 w-4" />Alerts</NavLink>
              <NavLink to="/profile" className={activeActionClass}>
                <UserCircle2 className="h-4 w-4" />
                Hi, {user.name.split(" ")[0]}
              </NavLink>
              <NavLink to="/settings" className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/70 hover:text-foreground">
                <Settings2 className="mr-1 inline h-4 w-4" />
                Settings
              </NavLink>
              <button onClick={handleLogout} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive">Logout</button>
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
            <button type="button" onClick={toggleTheme} className="flex items-center gap-2 py-2 text-sm text-muted-foreground">{resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</button>
            {filteredLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `max-w-full truncate text-sm py-2 ${isActive ? "text-primary" : "text-muted-foreground"}`
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

