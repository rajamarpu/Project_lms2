import React, { useCallback, useState } from 'react';
import { MdWbSunny, MdNightsStay, MdMenu } from 'react-icons/md';
import { useTheme } from '../../context/ThemeProvider';
import { useAdminSidebar } from '../../context/AdminSidebarContext';
import GlobalSearch from './navbar/GlobalSearch';
import DateRangePicker from './navbar/DateRangePicker';
import ProfileDropdown from './navbar/ProfileDropdown';

const Navbar = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { toggleMobileOpen } = useAdminSidebar();
  const isLight = resolvedTheme === 'light';
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <>
      <header className="admin-navbar h-16 border-b flex items-center justify-between gap-3 px-4 md:px-6 sticky top-0 z-30 bg-[var(--admin-nav-bg)] border-[var(--admin-nav-border)] backdrop-blur-lg">
        <button
          type="button"
          onClick={toggleMobileOpen}
          className="md:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[var(--admin-text-muted)] hover:text-white hover:bg-[var(--admin-surface-hover)] transition-colors"
          aria-label="Open menu"
        >
          <MdMenu size={20} />
        </button>

        <GlobalSearch />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="w-8 h-8 rounded-lg text-[var(--admin-text-muted)] hover:text-amber-500 hover:bg-[var(--admin-surface-hover)] active:scale-95 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/40 transition-all flex items-center justify-center"
          >
            {isLight ? <MdNightsStay size={18} /> : <MdWbSunny size={18} />}
          </button>

          <div className="hidden sm:block">
            <DateRangePicker />
          </div>

          <div className="w-px h-8 bg-[var(--admin-border-subtle)] hidden sm:block" />

          <ProfileDropdown onToast={showToast} />
        </div>
      </header>


      {toast && (
        <div
          role="status"
          className="fixed top-20 right-6 z-[100] px-4 py-2.5 rounded-xl text-xs font-medium text-[var(--admin-text-primary)] border shadow-lg bg-[var(--admin-surface-raised)] border-[var(--admin-border)] backdrop-blur-lg animate-fade-in"
        >
          {toast}
        </div>
      )}
    </>
  );
};

export default Navbar;
