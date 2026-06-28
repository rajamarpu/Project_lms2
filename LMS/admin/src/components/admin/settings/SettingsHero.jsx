import React from 'react';
import { motion } from 'framer-motion';
import {
  MdSettings,
  MdSave,
  MdSecurity,
  MdFileDownload,
  MdCheckCircle,
  MdSync,
} from 'react-icons/md';

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 7.5) % 88}%`,
  top: `${12 + (i * 11) % 76}%`,
  size: 3 + (i % 3),
  delay: i * 0.35,
}));

const STATUS_PILLS = [
  { label: 'System Healthy', color: '#10B981', icon: MdCheckCircle },
  { label: 'Profile Complete', color: '#3B82F6', icon: MdCheckCircle },
  { label: 'Last Sync Today', color: '#14B8A6', icon: MdSync },
];

const SettingsHero = ({ onSave, onSecurityCenter, onExport }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className="relative overflow-hidden rounded-3xl border border-[#3B82F6]/25 shadow-[0_24px_80px_rgba(59,130,246,0.14)]"
    style={{ background: 'var(--admin-hero-bg)' }}
  >
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'linear-gradient(135deg, rgba(59,130,246,0.42) 0%, rgba(139,92,246,0.32) 48%, rgba(20,184,166,0.28) 100%)',
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 45%),
          radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 40%),
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 32px 32px, 32px 32px',
      }}
    />
    <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#8B5CF6]/22 blur-[90px] pointer-events-none" />
    <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#3B82F6]/25 blur-[80px] pointer-events-none" />
    <div className="absolute top-1/3 right-[18%] w-48 h-48 rounded-full bg-[#14B8A6]/20 blur-[70px] pointer-events-none" />

    {PARTICLES.map((p) => (
      <motion.span
        key={p.id}
        className="absolute rounded-full bg-white/40 pointer-events-none"
        style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
        animate={{ opacity: [0.2, 0.7, 0.2], y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: p.delay }}
      />
    ))}

    <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
      <div className="flex flex-col sm:flex-row gap-6 sm:items-start flex-1 min-w-0">
        <div
          className="shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center border border-white/25 backdrop-blur-md shadow-[0_0_48px_rgba(59,130,246,0.45)]"
          style={{
            background: 'linear-gradient(145deg, #3B82F6 0%, #8B5CF6 50%, #14B8A6 100%)',
          }}
        >
          <MdSettings size={36} className="text-white" />
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight admin-text-primary mb-2">
            Settings Center
          </h1>
          <p className="admin-text-secondary text-sm md:text-base max-w-2xl mb-5">
            Manage your account, platform preferences, security settings, notifications and branding from one place.
          </p>

          <div className="flex flex-wrap gap-2">
            {STATUS_PILLS.map(({ label, color, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm"
                style={{
                  background: `rgba(${color === '#10B981' ? '16,185,129' : color === '#3B82F6' ? '59,130,246' : '20,184,166'},0.15)`,
                  borderColor: `${color}55`,
                  color,
                }}
              >
                <Icon size={14} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
        <motion.button
          type="button"
          whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(59,130,246,0.45)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/15"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #14B8A6 100%)',
          }}
        >
          <MdSave size={20} />
          Save Changes
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(239,68,68,0.25)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onSecurityCenter}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] hover:border-[#EF4444]/50 transition-all"
        >
          <MdSecurity size={20} className="text-[#EF4444]" />
          Security Center
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExport}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] hover:border-[#14B8A6]/50 transition-all"
        >
          <MdFileDownload size={20} className="text-[#14B8A6]" />
          Export Settings
        </motion.button>
      </div>
    </div>
  </motion.section>
);

export default SettingsHero;
