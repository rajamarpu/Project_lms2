import React from 'react';
import { motion } from 'framer-motion';
import { MdCreditCard, MdReceipt, MdAutorenew } from 'react-icons/md';
import SettingsToggle from '../SettingsToggle';

const INVOICES = [
  { date: 'May 30, 2025', desc: 'Enterprise Plan — May 2025', amount: '₹24,999', status: 'Paid' },
  { date: 'Apr 30, 2025', desc: 'Enterprise Plan — Apr 2025', amount: '₹24,999', status: 'Paid' },
  { date: 'Mar 30, 2025', desc: 'Enterprise Plan — Mar 2025', amount: '₹24,999', status: 'Paid' },
];

const BillingSection = ({ billing, onUpdate, accent }) => (
  <div className="space-y-6">
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-3xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      style={{
        borderColor: 'rgba(16,185,129,0.35)',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.08))',
        boxShadow: '0 12px 40px rgba(16,185,129,0.12)',
      }}
    >
      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 rounded-xl bg-[#10B981] flex items-center justify-center shadow-lg">
          <MdCreditCard size={26} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#34D399]">Active Plan</p>
          <h3 className="text-2xl font-extrabold admin-text-primary mt-1">{billing.plan}</h3>
          <p className="text-sm admin-text-secondary mt-1">{billing.amount}</p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-xs admin-text-muted">Next billing</p>
        <p className="text-sm font-semibold admin-text-primary">{billing.nextBilling}</p>
        <button
          type="button"
          className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:border-[#10B981]/50"
          style={{
            borderColor: 'var(--admin-border)',
            background: 'var(--admin-surface-raised)',
          }}
        >
          Manage Plan
        </button>
      </div>
    </motion.div>

    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface-raised)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MdAutorenew className="text-[#10B981]" size={20} />
          <div>
            <p className="text-sm font-semibold admin-text-primary">Auto-Renew</p>
            <p className="text-xs admin-text-muted">Renews on {billing.nextBilling}</p>
          </div>
        </div>
        <SettingsToggle
          value={billing.autoRenew}
          onChange={(v) => onUpdate({ autoRenew: v })}
          accent="#10B981"
        />
      </div>
      <div>
        <label className="text-xs font-semibold admin-text-muted uppercase tracking-wider">
          Invoice Email
        </label>
        <input
          type="email"
          value={billing.invoiceEmail}
          onChange={(e) => onUpdate({ invoiceEmail: e.target.value })}
          className="mt-2 w-full rounded-xl border px-4 py-2.5 text-sm admin-text-primary focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
          style={{
            background: 'var(--admin-surface)',
            borderColor: 'var(--admin-border)',
          }}
        />
      </div>
    </div>

    <div>
      <h4 className="text-sm font-bold admin-text-primary flex items-center gap-2 mb-3">
        <MdReceipt size={18} className="text-[#8B5CF6]" />
        Recent Invoices
      </h4>
      <div className="space-y-2">
        {INVOICES.map((row) => (
          <div
            key={row.date}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3"
            style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface-raised)' }}
          >
            <div>
              <p className="text-sm font-medium admin-text-primary">{row.desc}</p>
              <p className="text-xs admin-text-muted">{row.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold admin-text-primary">{row.amount}</span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default BillingSection;
