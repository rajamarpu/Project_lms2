import React from 'react';
import { motion } from 'framer-motion';
import { TABS } from './constants';

const SettingsNav = ({ activeTab, onTabChange }) => (
  <nav
    className="rounded-3xl p-3 space-y-1.5 border shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)] sticky top-4"
    style={{ borderColor: 'var(--admin-border)' }}
  >
    <p className="text-[10px] font-bold uppercase tracking-widest admin-text-muted px-3 pt-2 pb-1">
      Settings
    </p>
    {TABS.map((tab) => {
      const active = activeTab === tab.id;
      const Icon = tab.icon;
      return (
        <motion.button
          key={tab.id}
          type="button"
          whileHover={{ x: 2 }}
          onClick={() => onTabChange(tab.id)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 text-left"
          style={
            active
              ? {
                  background: `linear-gradient(135deg, rgba(${tab.rgb},0.22), rgba(${tab.rgb},0.08))`,
                  border: `1px solid rgba(${tab.rgb},0.4)`,
                  boxShadow: `0 0 20px rgba(${tab.rgb},0.2)`,
                  color: 'var(--admin-text-primary)',
                }
              : {
                  border: '1px solid transparent',
                  color: 'var(--admin-text-muted)',
                }
          }
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: active ? `rgba(${tab.rgb},0.28)` : `rgba(${tab.rgb},0.12)`,
              border: `1px solid rgba(${tab.rgb},${active ? '0.5' : '0.22'})`,
              boxShadow: active ? `0 0 14px rgba(${tab.rgb},0.35)` : 'none',
            }}
          >
            <Icon size={18} style={{ color: tab.color }} />
          </div>
          <span className={active ? 'font-semibold admin-text-primary' : ''}>{tab.label}</span>
        </motion.button>
      );
    })}
  </nav>
);

export default SettingsNav;
