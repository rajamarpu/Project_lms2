import React from 'react';
import { MdSearch, MdKeyboardArrowDown } from 'react-icons/md';

const selectClass =
  'w-full rounded-xl py-2.5 pl-4 pr-10 text-xs admin-text-primary focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition-all cursor-pointer appearance-none border bg-[var(--admin-surface)] border-[var(--admin-border)]';
const inputClass =
  'w-full rounded-xl py-2.5 pl-10 pr-4 text-xs admin-text-primary placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition-all border bg-[var(--admin-surface)] border-[var(--admin-border)]';

const TeachersFilters = ({ searchQuery, onSearchChange, filter, onFilterChange }) => (
  <div className="relative z-10 flex flex-wrap gap-3 items-center rounded-2xl p-4 border shadow-lg admin-surface border-[var(--admin-border)]">
    <div className="relative min-w-[200px] flex-1">
      <MdSearch
        className="absolute left-3.5 top-1/2 -translate-y-1/2 admin-text-secondary"
        size={18}
      />
      <input
        type="text"
        placeholder="Search mentors by name..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={inputClass}
      />
    </div>

    <div className="relative min-w-[140px]">
      <select value={filter} onChange={(e) => onFilterChange(e.target.value)} className={selectClass}>
        <option value="All">All Teachers</option>
        <option value="Active">Active</option>
        <option value="Disabled">Disabled</option>
      </select>
      <MdKeyboardArrowDown
        className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none"
        size={16}
      />
    </div>
  </div>
);

export default TeachersFilters;
