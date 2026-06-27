import { motion } from 'framer-motion';
import {
  MdBusiness,
  MdCloudDone,
  MdGroupAdd,
  MdMail,
  MdPublic,
  MdWarning,
} from 'react-icons/md';
import SettingsToggle from '../SettingsToggle';

const PlatformSection = ({ platform, onUpdate, accent }) => (
  <div className="space-y-6">
    <div
      className="rounded-2xl border p-5 flex gap-4"
      style={{
        borderColor: 'rgba(6,182,212,0.35)',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.15), transparent)',
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#06B6D4] shadow-lg flex-shrink-0">
        <MdBusiness size={26} className="text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold admin-text-primary">{platform.platformName}</h3>
        <p className="text-sm admin-text-secondary mt-1">
          Enterprise learning platform · {platform.language} · {platform.currency}
        </p>
        <p className="text-xs admin-text-muted mt-2 flex items-center gap-1">
          <MdPublic size={14} />
          {platform.timezone}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { icon: MdCloudDone, label: 'Uptime', value: '99.9%', color: '#10B981' },
        { icon: MdGroupAdd, label: 'Registrations', value: platform.allowRegistrations ? 'Open' : 'Closed', color: '#3B82F6' },
        { icon: MdMail, label: 'Support', value: platform.supportEmail.split('@')[0], color: '#8B5CF6' },
      ].map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="rounded-2xl border p-4"
            style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface-raised)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: stat.color }}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-[10px] uppercase tracking-wider admin-text-muted">{stat.label}</p>
            <p className="text-lg font-bold admin-text-primary truncate">{stat.value}</p>
          </motion.div>
        );
      })}
    </div>

    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface-raised)' }}
    >
      <h4 className="text-sm font-bold admin-text-primary">Access Controls</h4>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium admin-text-primary">Maintenance Mode</p>
          <p className="text-xs admin-text-muted">Temporarily block learner access</p>
        </div>
        <div className="flex items-center gap-2">
          {platform.maintenanceMode && (
            <span className="text-xs text-[#EF4444] flex items-center gap-1">
              <MdWarning size={14} /> Active
            </span>
          )}
          <SettingsToggle
            value={platform.maintenanceMode}
            onChange={(v) => onUpdate({ maintenanceMode: v })}
            accent="#EF4444"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium admin-text-primary">Allow Registrations</p>
          <p className="text-xs admin-text-muted">New student sign-ups</p>
        </div>
        <SettingsToggle
          value={platform.allowRegistrations}
          onChange={(v) => onUpdate({ allowRegistrations: v })}
          accent={accent}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium admin-text-primary">Email Verification</p>
          <p className="text-xs admin-text-muted">Required for new accounts</p>
        </div>
        <SettingsToggle
          value={platform.requireEmailVerification}
          onChange={(v) => onUpdate({ requireEmailVerification: v })}
          accent={accent}
        />
      </div>
    </div>
  </div>
);

export default PlatformSection;
