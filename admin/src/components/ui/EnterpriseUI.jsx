import { motion } from 'framer-motion';
import {
  LuArrowUpRight,
  LuCircleCheck,
  LuChevronDown,
  LuDownload,
  LuFilter,
  LuLoaderCircle,
  LuSearch,
} from 'react-icons/lu';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.99 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function PageShell({ eyebrow, title, description, actions, children, className = '' }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`admin-page page-shell min-h-full space-y-6 ${className}`}
    >
      <section className="admin-hero-band">
        <div className="min-w-0">
          {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
          <h1 className="admin-page-title brand-mix-heading">{title}</h1>
          {description && <p className="admin-page-description">{description}</p>}
        </div>
        {actions && <div className="admin-action-row">{actions}</div>}
      </section>
      {children}
    </motion.div>
  );
}

export function Button({ children, variant = 'primary', icon: Icon, className = '', disabled = false, ...props }) {
  return (
    <button
      className={`admin-btn admin-btn-${variant} ${className}`}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={16} aria-hidden />}
      <span>{children}</span>
    </button>
  );
}

export function StatWidget({ label, value, delta, tone = 'blue', icon: Icon, footer, source = 'Live database', onClick, ariaLabel }) {
  const displayValue = value === null || value === undefined || value === '' ? '—' : value;
  const interactive = typeof onClick === 'function';
  const sharedProps = {
    whileHover: { y: -4 },
    transition: { duration: 0.18, ease: 'easeOut' },
    className: `enterprise-card stat-widget tone-${tone} ${interactive ? 'stat-widget-clickable' : ''}`,
    'aria-label': ariaLabel || `${label}: ${displayValue}`,
  };

  const body = (
    <>
      <span className="stat-accent-line" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="stat-copy min-w-0">
          <p className="admin-label">{label}</p>
          <p className="stat-value">{displayValue}</p>
        </div>
        {Icon && (
          <div className="stat-icon">
            <Icon size={18} aria-hidden />
          </div>
        )}
      </div>
      <div className="stat-meta">
        {delta && (
          <span className="stat-delta">
            <LuArrowUpRight size={13} aria-hidden />
            {delta}
          </span>
        )}
        {footer && <span className="stat-detail">{footer}</span>}
      </div>
      <div className="stat-source"><span aria-hidden />{source}</div>
    </>
  );

  if (interactive) {
    return (
      <motion.button type="button" onClick={onClick} {...sharedProps}>
        {body}
      </motion.button>
    );
  }

  return <motion.article {...sharedProps}>{body}</motion.article>;
}

export function StatGrid({ children, className = '' }) {
  return <section className={`metric-grid ${className}`}>{children}</section>;
}

export function FilterBar({ value, onChange, placeholder = 'Search', children, onFilter, onExport }) {
  return (
    <section className="enterprise-card flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{placeholder}</span>
        <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
        <input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className="admin-input pl-9"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {children}
        {onFilter && <Button variant="ghost" icon={LuFilter} onClick={onFilter}>Filters</Button>}
        {onExport && <Button variant="ghost" icon={LuDownload} onClick={onExport}>Export</Button>}
      </div>
    </section>
  );
}

export function SelectControl({ label, value, onChange, options }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange?.(event.target.value)} className="admin-select">
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
    </label>
  );
}

export function EnterpriseTable({ columns, rows, emptyTitle = 'No records found', getRowKey, onSort }) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description="Adjust filters or create a new record to continue." />;
  }

  return (
    <div className="enterprise-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" aria-sort={column.sortable ? 'none' : undefined} className="sticky top-0 z-10 bg-[var(--admin-surface-raised)]">
                  {column.sortable && onSort ? <button type="button" onClick={() => onSort(column.key)} className="inline-flex items-center gap-1 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">{column.header}<LuChevronDown size={13} aria-hidden /></button> : <span>{column.header}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={getRowKey ? getRowKey(row) : row.id || index}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row) : (row[column.key] === null || row[column.key] === undefined || row[column.key] === '' ? '—' : row[column.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 border-t px-4 py-3 text-xs text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--border)' }}>
        <span>{rows.length} records shown</span>
        <span>Current filtered result set</span>
      </div>
    </div>
  );
}

export function ChartPanel({ title, description, children, action, className = '' }) {
  return (
    <section className={`enterprise-card ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">{title}</h2>
          {description && <p className="section-description">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <section className="enterprise-card empty-state">
      <div className="empty-state-icon">
        <LuCircleCheck size={22} aria-hidden />
      </div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </section>
  );
}

export function LoadingState({ label = 'Loading workspace' }) {
  return (
    <section className="enterprise-card loading-state" role="status" aria-live="polite">
      <LuLoaderCircle size={18} className="animate-spin" aria-hidden />
      <span>{label}</span>
      <div className="mt-5 grid w-full max-w-xl gap-3">
        <span className="skeleton-line h-3 w-2/3" />
        <span className="skeleton-line h-3 w-full" />
        <span className="skeleton-line h-3 w-4/5" />
      </div>
    </section>
  );
}

export function ProgressBar({ value, tone = 'blue' }) {
  const width = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="admin-progress" aria-label={`${width}% complete`}>
      <span className={`tone-${tone}`} style={{ width: `${width}%` }} />
    </div>
  );
}
