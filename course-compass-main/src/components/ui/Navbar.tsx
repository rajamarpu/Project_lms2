import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Menu, X, LayoutGrid, Shield, Settings, Search, Sparkles, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { useTheme } from "@/context/ThemeProvider";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/learning-paths", label: "Paths" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/certificates", label: "Certificates" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/payments", label: "Payments" },
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
  const hiddenForStaff = ["/certificates", "/dashboard", "/learning-paths", "/wishlist", "/payments"];
  const filteredLinks = links.filter((link) => !(isStaff && hiddenForStaff.includes(link.to)));

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/86 backdrop-blur-2xl">
      <div className="container flex h-[74px] items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/logo.webp" alt="UptoSkills Logo" className="h-10 w-auto" />
          </NavLink>
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            UptoSkills learning workspace
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-1 rounded-full border border-border bg-card/65 px-2 py-2 shadow-[var(--shadow-card)]">
          {filteredLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isInstructor && (
            <NavLink
              to="/portal"
              className={({ isActive }) =>
                `ml-1 flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-secondary-foreground" : "text-primary hover:text-primary"
                }`
              }
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Portal
            </NavLink>
          )}
          {isStaff && (
            <a
              href={import.meta.env.VITE_ADMIN_URL || "http://localhost:3001/admin-login"}
              className="ml-1 flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-destructive/90 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </a>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card/65 text-muted-foreground transition hover:text-primary"
                aria-label="Search catalog"
              >
                <Search className="h-4 w-4" />
              </button>
              <NavLink to="/notifications" aria-label="Notifications" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card/65 text-muted-foreground transition hover:text-primary">
                <Bell className="h-4 w-4" />
              </NavLink>
              <NavLink to="/settings" aria-label="Settings" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card/65 text-muted-foreground transition hover:text-primary">
                <Settings className="h-4 w-4" />
              </NavLink>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card/65 text-muted-foreground transition hover:text-primary"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <NavLink to="/profile" className="rounded-full border border-border bg-card/65 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary">
                Hi, {user.name.split(" ")[0]}
              </NavLink>
              <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">Logout</button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card/65 text-muted-foreground transition hover:text-primary"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <NavLink to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </NavLink>
              <NavLink to="/register" className="btn-primary !rounded-full !py-2.5 !px-5 text-sm">
                Get Started
              </NavLink>
            </>
          )}
        </div>

        <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/98 animate-fade-in">
          <div className="container flex flex-col gap-3 py-4">
            {filteredLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-3 py-3 text-sm ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isInstructor && (
              <NavLink
                to="/portal"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-2xl px-3 py-3 text-sm ${isActive ? "bg-secondary/10 text-secondary" : "text-primary/80"}`
                }
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Portal
              </NavLink>
            )}
            {isStaff && (
              <a
                href={import.meta.env.VITE_ADMIN_URL || "http://localhost:3001/admin-login"}
                className="flex items-center gap-1.5 rounded-2xl px-3 py-3 text-sm text-destructive/90"
              >
                <Shield className="h-3.5 w-3.5" /> Admin
              </a>
            )}
            <div className="my-2 border-t border-border" />
            {isAuthenticated && user ? (
              <>
                <NavLink to="/notifications" onClick={() => setOpen(false)} className="rounded-2xl px-3 py-3 text-sm text-muted-foreground">Notifications</NavLink>
                <NavLink to="/settings" onClick={() => setOpen(false)} className="rounded-2xl px-3 py-3 text-sm text-muted-foreground">Settings</NavLink>
                <button type="button" onClick={toggleTheme} className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm text-muted-foreground hover:text-primary">
                  {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <NavLink to="/profile" onClick={() => setOpen(false)} className="rounded-2xl px-3 py-3 text-sm font-medium text-foreground">
                  Hi, {user.name}
                </NavLink>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="px-3 py-3 text-left text-sm text-muted-foreground hover:text-foreground">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={toggleTheme} className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm text-muted-foreground hover:text-primary">
                  {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <NavLink to="/login" onClick={() => setOpen(false)} className="rounded-2xl px-3 py-3 text-sm text-muted-foreground hover:text-primary">
                  Sign In
                </NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)} className="rounded-2xl px-3 py-3 text-sm font-medium text-primary">
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
