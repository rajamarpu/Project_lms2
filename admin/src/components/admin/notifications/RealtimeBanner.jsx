import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';

const RealtimeBanner = ({ visible, newCount, onView, onDismiss }) => (
  <AnimatePresence>
    {visible && newCount > 0 && (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5"
        style={{
          borderColor: 'rgba(139, 92, 246, 0.35)',
          background:
            'linear-gradient(90deg, rgba(249,115,22,0.12) 0%, rgba(139,92,246,0.1) 100%)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F97316] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]" />
          </span>
          <p className="text-sm font-semibold admin-text-primary truncate">
            {newCount} new notification{newCount !== 1 ? 's' : ''}
          </p>
          <span className="hidden text-xs admin-text-muted sm:inline">Live sync</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onView}
            className="rounded-lg px-3 py-1 text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #F97316, #8B5CF6)' }}
          >
            View
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1 admin-text-muted hover:bg-[var(--admin-surface-hover)]"
            aria-label="Dismiss"
          >
            <MdClose size={16} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default RealtimeBanner;
