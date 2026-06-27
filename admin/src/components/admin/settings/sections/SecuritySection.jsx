import { motion } from 'framer-motion';
import {
  MdCheckCircle,
  MdLock,
  MdShield,
  MdWarning,
} from 'react-icons/md';
import { computeSecurityScore } from '../constants';

const CHECKLIST = [
  { key: 'twoFactorEnabled', label: 'Two-Factor Authentication (2FA)' },
  { key: 'strongPassword', label: 'Strong Password Policy' },
  { key: 'recentLogin', label: 'Recent Login Verified' },
];

const SecuritySection = ({ security, onUpdate, sectionRef }) => {
  const score = computeSecurityScore(security);

  return (
    <div ref={sectionRef} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border p-6 md:p-8 overflow-hidden relative"
        style={{
          borderColor: 'rgba(239,68,68,0.4)',
          background:
            'linear-gradient(135deg, rgba(239,68,68,0.35) 0%, rgba(59,130,246,0.16) 50%, rgba(15,23,42,0.4) 100%)',
          boxShadow: '0 20px 50px rgba(239,68,68,0.15)',
        }}
      >
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-[#EF4444]/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#BFDBFE] mb-2">
              Security Overview
            </p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold text-white tabular-nums">{score}%</span>
              <span className="text-sm text-white/80 mb-2">Security Score</span>
            </div>
            <ul className="mt-6 space-y-3">
              {CHECKLIST.map(({ key, label }) => {
                const done = security[key];
                return (
                  <li key={key} className="flex items-center gap-3 text-sm">
                    {done ? (
                      <MdCheckCircle className="text-[#10B981] flex-shrink-0" size={20} />
                    ) : (
                      <MdWarning className="text-[#FBBF24] flex-shrink-0" size={20} />
                    )}
                    <span className={done ? 'text-white/95' : 'text-white/70'}>{label}</span>
                    {!done && key === 'twoFactorEnabled' && (
                      <button
                        type="button"
                        onClick={() => onUpdate({ twoFactorEnabled: true })}
                        className="ml-auto text-xs font-semibold px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                      >
                        Enable
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <motion.button
            type="button"
            whileHover={{ boxShadow: '0 12px 36px rgba(239,68,68,0.45)' }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)' }}
          >
            <MdShield size={20} />
            Manage Security
          </motion.button>
        </div>
      </motion.div>

      <div
        className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface-raised)' }}
      >
        <h3 className="text-sm font-bold admin-text-primary flex items-center gap-2">
          <MdLock size={18} className="text-[#EF4444]" />
          Active Sessions
        </h3>
        {[
          { device: 'Chrome on Windows 11', location: 'Mumbai, India', current: true, time: 'Now' },
          { device: 'Safari on iPhone 15', location: 'Delhi, India', current: false, time: '2 hrs ago' },
        ].map((session) => (
          <div
            key={session.device}
            className="flex items-center justify-between py-3 border-b last:border-0"
            style={{ borderColor: 'var(--admin-border-subtle)' }}
          >
            <div>
              <p className="text-sm font-medium admin-text-primary flex items-center gap-2">
                {session.device}
                {session.current && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                    Current
                  </span>
                )}
              </p>
              <p className="text-xs admin-text-muted">
                {session.location} · {session.time}
              </p>
            </div>
            {!session.current && (
              <button
                type="button"
                className="text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecuritySection;
