import { NavLink, useNavigate } from "react-router-dom";
import { GraduationCap, Menu, X, LayoutGrid, Shield, LogOut, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/certificates", label: "Certificates" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Lock body scroll while the mobile menu is open, and always close
  // the menu on route change so it never lingers open after navigation.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  const handleNavClick = () => setOpen(false);

  const isStaff = user?.role === "admin";
  const hiddenForStaff = ["/certificates", "/dashboard", "/learning-paths"];
  const filteredLinks = links.filter((l) => !(isStaff && hiddenForStaff.includes(l.to)));

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-2 shrink-0" onClick={handleNavClick}>
          <img src="/logo.webp" alt="UptoSkills Logo" className="h-9 md:h-10 w-auto" />
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {filteredLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? "nav-link-active" : "nav-link-inactive"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/portal"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive ? "text-primary" : "text-primary/70 hover:text-primary"
                }`
              }
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Portal
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive ? "text-destructive" : "text-destructive/80 hover:text-destructive"
                }`
              }
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop auth area */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <NavLink to="/profile" className="text-sm font-medium hover:text-primary transition-colors truncate max-w-[140px]">
                Hi, {user.name.split(" ")[0]}
              </NavLink>
              <button onClick={handleLogout} className="btn-outline-teal btn-sm">
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Login
              </NavLink>
              <NavLink to="/register" className="btn-primary btn-sm">
                Sign Up
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile menu toggle — 44px tap target */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden tap-target flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="container py-4 flex flex-col gap-1">
            {filteredLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `tap-target flex items-center px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            {user?.role === "admin" && (
              <NavLink
                to="/portal"
                onClick={handleNavClick}
                className="tap-target flex items-center gap-2 px-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <LayoutGrid className="w-4 h-4" /> Portal
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                onClick={handleNavClick}
                className="tap-target flex items-center gap-2 px-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Shield className="w-4 h-4" /> Admin
              </NavLink>
            )}

            <div className="h-px bg-border my-2" />

            {isAuthenticated && user ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={handleNavClick}
                  className="tap-target flex items-center gap-2 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  {user.name}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="tap-target flex items-center gap-2 px-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-1">
                <NavLink to="/login" onClick={handleNavClick} className="btn-outline-teal w-full">
                  Login
                </NavLink>
                <NavLink to="/register" onClick={handleNavClick} className="btn-primary w-full">
                  Sign Up
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
