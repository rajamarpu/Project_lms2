import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User, Clock } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { AuthHeroBackground } from "@/components/ui/AuthHeroBackground";
import logo from "../../../../admin/src/assets/logo.webp";

const Register = () => {
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [adminUrl, setAdminUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "admin") {
      setForm((prevState) => ({ ...prevState, role: "admin" }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (form.role !== "admin") return;
    let mounted = true;
    (async () => {
      const host = window.location.hostname;
      const proto = window.location.protocol;
      const ports = [3002, 3001, 3003];
      for (const p of ports) {
        const url = `${proto}//${host}:${p}`;
        try {
          await fetch(url, { method: "GET", mode: "no-cors" });
          if (mounted) setAdminUrl(url);
          return;
        } catch (e) {
          // try next
        }
      }
      if (mounted) setAdminUrl(null);
    })();
    return () => {
      mounted = false;
    };
  }, [form.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);

    try {
      const result = await register(form.name, form.email, form.password, form.role);
      if (result?.pending) {
        setPendingMessage(result.message || "Your account is pending admin approval.");
      } else if (form.role === "admin") {
        const tryPorts = async () => {
          const host = window.location.hostname;
          const proto = window.location.protocol;
          const ports = [3001, 3002, 3003];
          for (const p of ports) {
            const url = `${proto}//${host}:${p}`;
            try {
              await fetch(url, { method: "GET", mode: "no-cors" });
              window.location.href = url;
              return;
            } catch (e) {
              // try next
            }
          }
          window.location.href = "/portal";
        };
        await tryPorts();
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.response?.data?.error || "Registration failed. Please try again.";
      if (errorMsg.includes("already exists")) {
        setError("An account with this email already exists. Please try logging in instead.");
      } else if (errorMsg.includes("Connection refused") || errorMsg.includes("running")) {
        setError("Server is not responding. Please ensure the backend is running on http://localhost:5000");
      } else if (errorMsg.includes("Network")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "bg-destructive", width: "w-1/4" };
    if (p.length < 8) return { label: "Weak", color: "bg-orange-500", width: "w-1/2" };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "Medium", color: "bg-yellow-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-secondary", width: "w-full" };
  };

  const strength = passwordStrength();

  if (form.role === "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {adminUrl ? (
          <iframe title="Admin App" src={adminUrl} className="w-full h-screen border-0" />
        ) : (
          <div className="text-center p-8">
            <p className="mb-4 text-muted-foreground">Admin app not reachable locally.</p>
            <p className="mb-4">Open the admin app in a new tab:</p>
            <div className="flex gap-3 justify-center">
              <a href={`${window.location.protocol}//${window.location.hostname}:3002`} target="_blank" rel="noreferrer" className="btn-outline-teal px-4 py-2">Open :3002</a>
              <a href={`${window.location.protocol}//${window.location.hostname}:3001`} target="_blank" rel="noreferrer" className="btn-outline-teal px-4 py-2">Open :3001</a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="no-theme min-h-screen flex items-center justify-center bg-[#0d1117] relative overflow-hidden font-sans">
      <AuthHeroBackground />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] bg-accent-cyan rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-30%] right-[-30%] w-[60%] h-[60%] bg-accent-purple rounded-full blur-[120px] opacity-30" />
      </div>

      <button
        type="button"
        onClick={() => (window.history.length > 1 ? window.history.back() : window.location.assign("/"))}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-sm z-20"
      >
        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
        Back
      </button>

      <div className="max-w-md w-full mx-4 glass-card p-8 rounded-2xl relative z-10">
        <div className="text-center mb-6">
          <img src={logo} alt="UptoSkills Logo" className="mx-auto h-12 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Create Student Account</h2>
          <p className="text-[#cbd5e1] text-sm mb-4">Sign up to access your courses, quizzes, and student dashboard.</p>
        </div>

        {pendingMessage ? (
          <div className="glass-card p-8 border border-amber-500/30 bg-amber-500/5 shadow-[0_0_50px_rgba(251,191,36,0.18)] mb-6">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">Account Pending Approval</h2>
            <p className="text-sm text-muted-foreground mb-6">{pendingMessage}</p>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20"
            >
              Go to Sign In
            </Link>
          </div>
        ) : null}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl text-sm text-red-200 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="register-name" className="text-sm font-medium text-white/80">Full Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full bg-[#1a1f2e] border border-white/20 rounded-2xl px-11 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-medium text-white/80">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#1a1f2e] border border-white/20 rounded-2xl px-11 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-medium text-white/80">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full bg-[#1a1f2e] border border-white/20 rounded-2xl px-11 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="register-confirm" className="text-sm font-medium text-white/80">Confirm Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="register-confirm"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={`w-full bg-[#1a1f2e] border rounded-2xl px-11 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                    : "border-white/20 focus:border-accent-cyan focus:ring-accent-cyan/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {strength && (
            <div className="space-y-2">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className={`${strength.width} ${strength.color} h-full rounded-full transition-all duration-500`} />
              </div>
              <p className="text-xs text-muted-foreground">Strength: <span className="font-medium">{strength.label}</span></p>
            </div>
          )}

          <button
            id="register-submit"
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-600 text-white font-semibold py-3 shadow-[0_18px_50px_rgba(56,189,248,0.2)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(56,189,248,0.3)] disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating account…
              </span>
            ) : (
              <span className="inline-flex items-center justify-center">Create Account</span>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">Already have an account?</div>
          </div>

          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-white/5 px-5 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-500/10 transition"
          >
            Sign In Instead
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Register;
