import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdEmail, MdVisibilityOff, MdVisibility } from 'react-icons/md';
import { FaJava, FaGitAlt, FaGithub, FaDocker, FaPython, FaReact, FaJs, FaNodeJs, FaHtml5, FaCss3Alt } from 'react-icons/fa';
import { SiCplusplus, SiTypescript } from 'react-icons/si';
import logo from '../../assets/logo.webp';
import { adminRegister } from '../../api/admin';

const techIcons = [
  { Icon: FaJava, className: "top-[10%] left-[6%] text-orange-500/30", size: 48, delay: "0s", duration: "8s" },
  { Icon: FaReact, className: "top-[25%] left-[18%] text-cyan-500/30", size: 36, delay: "1.5s", duration: "6.5s" },
  { Icon: SiTypescript, className: "top-[35%] left-[26%] text-blue-500/30", size: 38, delay: "3s", duration: "8.5s" },
  { Icon: FaGitAlt, className: "top-[48%] left-[8%] text-red-500/30", size: 40, delay: "2s", duration: "7s" },
  { Icon: FaGithub, className: "top-[68%] left-[15%] text-slate-400/40", size: 52, delay: "4s", duration: "9s" },
  { Icon: FaNodeJs, className: "top-[82%] left-[7%] text-green-500/30", size: 42, delay: "2.5s", duration: "9.5s" },
  { Icon: FaDocker, className: "top-[8%] right-[8%] text-blue-500/30", size: 56, delay: "1s", duration: "10s" },
  { Icon: SiCplusplus, className: "top-[24%] right-[22%] text-indigo-500/30", size: 44, delay: "3s", duration: "8s" },
  { Icon: FaCss3Alt, className: "top-[40%] right-[10%] text-blue-400/30", size: 38, delay: "0.5s", duration: "7.5s" },
  { Icon: FaHtml5, className: "top-[56%] right-[24%] text-orange-600/30", size: 34, delay: "2s", duration: "7s" },
  { Icon: FaJs, className: "top-[72%] right-[8%] text-yellow-500/30", size: 38, delay: "3.5s", duration: "8.5s" },
  { Icon: FaPython, className: "top-[86%] right-[18%] text-yellow-500/30", size: 48, delay: "5s", duration: "7.5s" }
];

const AdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email, and password are required.');
      return;
    }

    try {
      const response = await adminRegister({ name: name.trim(), email: email.trim(), password });

      if (response && response.success) {
        setSuccess('Admin account created successfully. Redirecting to sign in...');
        setTimeout(() => navigate('/admin-login', { replace: true }), 800);
      } else {
        setError(response?.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err?.message || 'Registration failed. Please try again.');
    }
  };

  const handleBack = () => navigate('/admin-login');

  return (
    <div className="no-theme min-h-screen flex items-center justify-center bg-[#0d1117] relative overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] bg-accent-cyan rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-30%] right-[-30%] w-[60%] h-[60%] bg-accent-purple rounded-full blur-[120px] opacity-30" />
        {techIcons.map((item, idx) => (
          <item.Icon key={idx} size={item.size} className={`absolute animate-float transition-all duration-500 ${item.className}`} style={{ animationDelay: item.delay, animationDuration: item.duration }} />
        ))}
      </div>

      <button onClick={handleBack} className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-sm">
        <MdArrowBack className="group-hover:-translate-x-1 transition-transform" /> Back to Login
      </button>

      <div className="max-w-md w-full mx-4 glass-card p-8 rounded-2xl relative z-10">
        <div className="text-center mb-6">
          <img src={logo} alt="logo" className="mx-auto h-12 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Create Admin Account</h2>
          <p className="text-[#cbd5e1] text-sm mb-4">Create an account. Admin privileges require manual approval.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-sm text-red-200 mb-4">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/50 p-3 rounded-lg text-sm text-green-200 mb-4">{success}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-[#1a1f2e] border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan" />
          </div>
          <div className="relative">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-[#1a1f2e] border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan" />
            <MdEmail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-[#1a1f2e] border border-white/20 rounded-md px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <MdVisibility size={18} /> : <MdVisibilityOff size={18} />}</button>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-bold py-3 rounded-md">Create Account</button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Use email and password to create an admin account.
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
