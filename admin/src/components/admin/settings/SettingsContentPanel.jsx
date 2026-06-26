import { AnimatePresence, motion } from 'framer-motion';

const SettingsContentPanel = ({ activeTab, children }) => (
  <div
    className="rounded-3xl border p-6 md:p-8 min-h-[320px] shadow-[var(--admin-shadow-card)]"
    style={{
      borderColor: 'var(--admin-border)',
      background: 'var(--admin-surface)',
      backdropFilter: 'blur(20px)',
    }}
  >
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  </div>
);

export default SettingsContentPanel;
