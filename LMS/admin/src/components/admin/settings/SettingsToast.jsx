import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdCheckCircle, MdClose } from 'react-icons/md';

const SettingsToast = ({ show, message, onHide }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border border-[#10B981]/40"
        style={{
          background: 'var(--admin-surface-raised)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <MdCheckCircle size={20} className="text-[#10B981] flex-shrink-0" />
        <span className="text-sm font-medium admin-text-primary">{message}</span>
        <button
          type="button"
          onClick={onHide}
          className="ml-1 admin-text-muted hover:admin-text-primary transition-colors"
          aria-label="Dismiss"
        >
          <MdClose size={16} />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

export default SettingsToast;
