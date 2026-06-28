import React from 'react';

const DashboardKpiSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border p-5 animate-pulse bg-[var(--admin-kpi-base)]"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          <div className="h-6 bg-white/10 rounded w-24 mb-4" />
          <div className="h-10 bg-white/5 rounded w-32" />
        </div>
      ))}
    </div>
  );
};

export default DashboardKpiSkeleton;
