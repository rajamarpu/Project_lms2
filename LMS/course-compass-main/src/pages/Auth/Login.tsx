import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, X, Eye, EyeOff, Cpu, Code2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { AuthHeroBackground } from "@/components/ui/AuthHeroBackground";
import logo from "../../../../admin/src/assets/logo.webp";
import { redirectToAdminAuth } from "@/utils/adminAuth";

const Login = () => {
  const [searchParams] = useSearchParams();
  const selectedRole = searchParams.get("role") === "admin" ? "admin" : "student";
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      if (loggedInUser.role === "admin" || loggedInUser.role === "instructor") {
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
              // try next port
            }
          }
          window.location.href = "/portal";
        };
        await tryPorts();
        return;
      }

      navigate("/dashboard", { replace: true });
      return;
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole !== "admin") return;
    redirectToAdminAuth("/admin-login");
  }, [selectedRole]);

  if (selectedRole === "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <p className="mb-4 text-muted-foreground">Redirecting you to the admin sign-in page…</p>
          <p className="text-sm text-muted-foreground">If nothing happens, open the admin app manually.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="no-theme min-h-screen flex items-center justify-center bg-[#0d1117] relative overflow-hidden font-sans">
      <AuthHeroBackground />

      <button
        onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-sm z-20"
      >
        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
        Back
      </button>
      <button
        type="button"
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20"
        onClick={() => window.location.assign("/")}
      >
        <X size={20} />
      </button>

      <div className="relative w-full max-w-lg px-4 z-10">
        <div className="glass-card glass-card-hover relative overflow-hidden rounded-[2rem] border border-white/10 bg-card/80 shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-25%] left-[5%] h-24 w-24 rounded-full bg-accent-cyan/20 blur-3xl" />
            <div className="absolute top-[10%] left-[10%] text-white/10 animate-float">
              <Cpu size={56} />
            </div>
            <div className="absolute top-[30%] left-[80%] text-white/10 animate-float delay-2000">
              <Code2 size={48} />
            </div>
            <div className="absolute bottom-[10%] right-[10%] text-white/10 animate-float delay-4000">
              <ShieldCheck size={52} />
            </div>
          </div>
          <div className="relative p-8 pt-10">
            <div className="text-center mb-6">
              <img src={logo} alt="UptoSkills Logo" className="mx-auto h-12 mb-4" />
              <h2 className="text-3xl font-bold text-[#f8fafc] mb-2 tracking-tight">Student Sign In</h2>
              <p className="text-[#cbd5e1] text-sm mb-5">Sign in to access your student dashboard and course content.</p>
              <div className="bg-blue-500/10 border border-blue-500/30 px-4 py-3 rounded-2xl text-xs text-blue-100 inline-flex flex-col items-start gap-1 mx-auto w-full max-w-[26rem]">
                <span className="font-semibold uppercase tracking-[0.1em]">Use your registered account</span>
                <span>Enter the email and password you created when signing up.</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-2xl text-sm text-red-200 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium text-white/80">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full bg-[#141b2f] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all"
                    autoComplete="email"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium text-white/80">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-[#141b2f] border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-600 text-white font-semibold py-3 shadow-[0_18px_50px_rgba(56,189,248,0.2)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(56,189,248,0.3)] disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don’t have an account? <Link to="/register" className="text-cyan-300 hover:underline">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
