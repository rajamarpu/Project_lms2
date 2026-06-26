import React from 'react';
import {
  MdSearch,
  MdFilterList,
  MdInbox,
  MdTimeline,
  MdSelectAll,
  MdMarkEmailRead,
  MdArchive,
  MdDelete,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIMARY_FILTERS, PRIORITIES, PRIORITY_META } from './constants';

const NotificationsToolbar = ({
  search,
  onSearchChange,
  primaryFilter,
  onPrimaryFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  readFilter,
  onReadFilterChange,
  viewMode,
  onViewModeChange,
  selectionMode,
  onSelectionModeToggle,
  showArchived,
  onShowArchivedChange,
  selectedCount,
  onSelectAllVisible,
  onBulkMarkRead,
  onBulkArchive,
  onBulkDelete,
  onClearSelection,
}) => {
  return (
    <div className="space-y-3">
      <div
        className="flex flex-col gap-3 rounded-2xl border p-3 shadow-[var(--admin-shadow-card)] lg:flex-row lg:items-center lg:justify-between"
        style={{
          borderColor: 'var(--admin-border)',
          background: 'var(--admin-surface)',
        }}
      >
        <div className="relative flex-1 max-w-md">
          <MdSearch
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 admin-text-muted"
            size={18}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notifications…"
            className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm admin-text-primary placeholder:admin-text-muted focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30"
            style={{
              borderColor: 'var(--admin-input-border)',
              background: 'var(--admin-input-bg)',
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <MdFilterList className="mr-0.5 admin-text-muted" size={16} />
          {PRIMARY_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onPrimaryFilterChange(f)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                primaryFilter === f
                  ? 'text-white shadow-md'
                  : 'admin-text-muted hover:bg-[var(--admin-surface-hover)] hover:admin-text-primary'
              }`}
              style={
                primaryFilter === f
                  ? {
                      background: 'linear-gradient(135deg, #F97316, #8B5CF6)',
                    }
                  : undefined
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex flex-col gap-3 rounded-2xl border p-3 lg:flex-row lg:items-center lg:justify-between"
        style={{
          borderColor: 'var(--admin-border)',
          background: 'var(--admin-surface)',
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {primaryFilter === 'Priority' && (
            <div
              className="flex flex-wrap gap-1 border-r pr-2"
              style={{ borderColor: 'var(--admin-border-subtle)' }}
            >
              <button
                type="button"
                onClick={() => onPriorityFilterChange('all')}
                className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                  priorityFilter === 'all'
                    ? 'admin-text-primary bg-[var(--admin-surface-hover)]'
                    : 'admin-text-muted'
                }`}
              >
                All
              </button>
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPriorityFilterChange(p)}
                  className={`rounded-md border px-2 py-1 text-[10px] font-bold capitalize ${
                    priorityFilter === p ? '' : 'border-transparent admin-text-muted'
                  }`}
                  style={
                    priorityFilter === p
                      ? {
                          background: PRIORITY_META[p].badgeBg,
                          borderColor: PRIORITY_META[p].badgeBorder,
                          color: PRIORITY_META[p].badgeText,
                        }
                      : undefined
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {primaryFilter === 'Read/Unread' && (
            <div
              className="flex gap-1 border-r pr-2"
              style={{ borderColor: 'var(--admin-border-subtle)' }}
            >
              {['all', 'unread', 'read'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onReadFilterChange(r)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold capitalize ${
                    readFilter === r
                      ? 'admin-text-primary bg-[var(--admin-surface-hover)]'
                      : 'admin-text-muted'
                  }`}
                >
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>
          )}

          <div
            className="flex rounded-lg border p-0.5"
            style={{ borderColor: 'var(--admin-border)' }}
          >
            <button
              type="button"
              onClick={() => onViewModeChange('inbox')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                viewMode === 'inbox'
                  ? 'admin-text-primary bg-[var(--admin-surface-hover)]'
                  : 'admin-text-muted'
              }`}
            >
              <MdInbox size={14} /> Inbox
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('timeline')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                viewMode === 'timeline'
                  ? 'admin-text-primary bg-[var(--admin-surface-hover)]'
                  : 'admin-text-muted'
              }`}
            >
              <MdTimeline size={14} /> Timeline
            </button>
          </div>

          <button
            type="button"
            onClick={onSelectionModeToggle}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
              selectionMode
                ? 'border-[#8B5CF6]/40 text-[#8B5CF6]'
                : 'admin-text-muted'
            }`}
            style={{
              borderColor: selectionMode ? undefined : 'var(--admin-border)',
              background: selectionMode ? 'rgba(139, 92, 246, 0.12)' : undefined,
            }}
          >
            <MdSelectAll size={14} /> Select
          </button>

          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] admin-text-muted">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => onShowArchivedChange(e.target.checked)}
              className="rounded border-[var(--admin-border)]"
            />
            Archived
          </label>
        </div>
      </div>

      <AnimatePresence>
        {selectionMode && selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap items-center gap-2 rounded-xl border px-4 py-2.5"
            style={{
              borderColor: 'rgba(139, 92, 246, 0.35)',
              background: 'rgba(139, 92, 246, 0.1)',
            }}
          >
            <span className="text-xs font-semibold text-[#8B5CF6]">
              {selectedCount} selected
            </span>
            <button
              type="button"
              onClick={onSelectAllVisible}
              className="text-[11px] font-medium admin-text-muted hover:admin-text-primary"
            >
              Select all visible
            </button>
            <span className="admin-text-muted opacity-40">|</span>
            <button
              type="button"
              onClick={onBulkMarkRead}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold admin-text-primary hover:bg-[var(--admin-surface-hover)]"
            >
              <MdMarkEmailRead size={13} /> Mark read
            </button>
            <button
              type="button"
              onClick={onBulkArchive}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold admin-text-primary hover:bg-[var(--admin-surface-hover)]"
            >
              <MdArchive size={13} /> Archive
            </button>
            <button
              type="button"
              onClick={onBulkDelete}
              className="flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/25"
            >
              <MdDelete size={13} /> Delete
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="ml-auto text-[11px] admin-text-muted hover:admin-text-primary"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsToolbar;
