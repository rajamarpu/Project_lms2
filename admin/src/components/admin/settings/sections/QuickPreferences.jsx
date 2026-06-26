import { motion } from 'framer-motion';
import { MdDarkMode, MdLanguage, MdSchedule, MdPalette } from 'react-icons/md';
import { useTheme } from '../../../../context/ThemeProvider';
import { ACCENT_PRESETS } from '../constants';
const QuickPreferences = ({ quickPrefs, accent, onQuickPrefsChange, onAccentChange }) => {
  const { theme, setTheme } = useTheme();

  const cards = [
    {
      key: 'theme',
      title: 'Theme',
      description: 'Dashboard color mode',
      icon: MdDarkMode,
      color: '#8B5CF6',
      control: (
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="text-xs font-semibold rounded-lg px-2 py-1.5 border admin-text-primary cursor-pointer"
          style={{
            background: 'var(--admin-surface-raised)',
            borderColor: 'var(--admin-border)',
          }}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      ),
    },
    {
      key: 'language',
      title: 'Language',
      description: 'Interface & emails',
      icon: MdLanguage,
      color: '#3B82F6',
      control: (
        <select
          value={quickPrefs.language}
          onChange={(e) => onQuickPrefsChange({ language: e.target.value })}
          className="text-xs font-semibold rounded-lg px-2 py-1.5 border admin-text-primary max-w-[130px] cursor-pointer"
          style={{
            background: 'var(--admin-surface-raised)',
            borderColor: 'var(--admin-border)',
          }}
        >
          {['English (India)', 'Hindi', 'Tamil', 'English (US)'].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'timezone',
      title: 'Timezone',
      description: 'Schedules & reports',
      icon: MdSchedule,
      color: '#14B8A6',
      control: (
        <select
          value={quickPrefs.timezone}
          onChange={(e) => onQuickPrefsChange({ timezone: e.target.value })}
          className="text-xs font-semibold rounded-lg px-2 py-1.5 border admin-text-primary max-w-[150px] cursor-pointer"
          style={{
            background: 'var(--admin-surface-raised)',
            borderColor: 'var(--admin-border)',
          }}
        >
          {['Asia/Kolkata (IST)', 'America/New_York (EST)', 'Europe/London (GMT)'].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'accent',
      title: 'Accent Color',
      description: 'Highlights & buttons',
      icon: MdPalette,
      color: accent,
      control: (
        <div className="flex gap-1.5">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.label}
              onClick={() => {
                onAccentChange(p.value, p.id);
                onQuickPrefsChange({ accentId: p.id });
              }}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110"
              style={{
                background: p.value,
                outline: quickPrefs.accentId === p.id ? `2px solid ${p.value}` : 'none',
                outlineOffset: 2,
                boxShadow: quickPrefs.accentId === p.id ? `0 0 12px ${p.value}` : 'none',
              }}
            />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider admin-text-muted mb-4">
        Quick Preferences
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, boxShadow: 'var(--admin-shadow-card)' }}
              className="rounded-2xl border p-4 flex items-start gap-3 transition-all"
              style={{
                borderColor: 'var(--admin-border)',
                background: 'var(--admin-surface-raised)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ background: card.color }}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold admin-text-primary">{card.title}</p>
                <p className="text-xs admin-text-muted mt-0.5 mb-3">{card.description}</p>
                {card.control}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickPreferences;
