import { motion } from 'framer-motion';

/**
 * StatsCard – compact KPI card used on the dashboard.
 * Props:
 *   title: string – label of the stat
 *   value: string | number – displayed value
 *   icon?: ReactNode – optional icon element
 */
const StatsCard = ({ title, value, icon }) => {
  return (
    <motion.div
      className="glass-card gradient-border flex items-center space-x-3 rounded-3xl border border-[var(--border)] p-4"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {icon && <div className="text-[var(--accent)] text-xl">{icon}</div>}
      <div className="flex flex-col">
        <span className="text-sm font-medium admin-text-secondary">{title}</span>
        <span className="text-lg font-semibold admin-text-primary">{value}</span>
      </div>
    </motion.div>
  );
};

export default StatsCard;
