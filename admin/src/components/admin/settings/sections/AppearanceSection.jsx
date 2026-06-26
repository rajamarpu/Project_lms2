import { motion } from 'framer-motion';
import { MdCheck } from 'react-icons/md';
import { useTheme } from '../../../../context/ThemeProvider';
import { ACCENT_PRESETS } from '../constants';
import SettingsToggle from '../SettingsToggle';

const THEME_OPTIONS = [
  {
    key: 'dark',
    label: 'Dark',
    preview: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    bar: '#334155',
  },
  {
    key: 'light',
    label: 'Light',
    preview: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    bar: '#cbd5e1',
  },
  {
    key: 'system',
    label: 'System',
    preview: 'linear-gradient(90deg, #0f172a 50%, #f8fafc 50%)',
    bar: '#94a3b8',
  },
];

const AppearanceSection = ({
  accent,
  accentId,
  onAccentChange,
  compact,
  animations,
  onCompactChange,
  onAnimationsChange,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider admin-text-muted mb-4">
          Color Theme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {THEME_OPTIONS.map((t) => {
            const active = theme === t.key;
            return (
              <motion.button
                key={t.key}
                type="button"
                whileHover={{ y: -4 }}
                onClick={() => setTheme(t.key)}
                className="rounded-2xl border p-4 text-left transition-all"
                style={{
                  borderColor: active ? 'rgba(139,92,246,0.55)' : 'var(--admin-border)',
                  boxShadow: active ? '0 0 24px rgba(139,92,246,0.25)' : 'none',
                  background: 'var(--admin-surface-raised)',
                }}
              >
                <div
                  className="h-20 rounded-xl mb-3 border overflow-hidden"
                  style={{ background: t.preview, borderColor: 'var(--admin-border-subtle)' }}
                >
                  <div className="h-3 m-2 rounded" style={{ background: t.bar, width: '40%' }} />
                  <div className="h-2 m-2 mt-1 rounded opacity-60" style={{ background: t.bar, width: '70%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold admin-text-primary">{t.label}</span>
                  {active && <MdCheck className="text-[#8B5CF6]" size={20} />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider admin-text-muted mb-4">
          Accent Color
        </h3>
        <div className="flex flex-wrap gap-4">
          {ACCENT_PRESETS.map((p) => {
            const active = accentId === p.id || accent === p.value;
            return (
              <motion.button
                key={p.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                onClick={() => onAccentChange(p.value, p.id)}
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border min-w-[88px]"
                style={{
                  borderColor: active ? p.value : 'var(--admin-border)',
                  background: active ? `${p.value}18` : 'var(--admin-surface-raised)',
                  boxShadow: active ? `0 0 20px ${p.value}44` : 'none',
                }}
              >
                <span
                  className="w-10 h-10 rounded-full shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${p.value}, ${p.value}99)` }}
                />
                <span className="text-xs font-semibold admin-text-primary">{p.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--admin-border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold admin-text-primary">Compact Mode</p>
            <p className="text-xs admin-text-muted">Tighter spacing across the dashboard</p>
          </div>
          <SettingsToggle value={compact} onChange={onCompactChange} accent={accent} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold admin-text-primary">Animations</p>
            <p className="text-xs admin-text-muted">Motion and transition effects</p>
          </div>
          <SettingsToggle value={animations} onChange={onAnimationsChange} accent={accent} />
        </div>
      </div>
    </div>
  );
};

export default AppearanceSection;
