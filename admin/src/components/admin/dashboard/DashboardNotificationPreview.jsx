import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdNotificationsActive, MdArrowForward } from 'react-icons/md';
import { apiFetch } from '../../../api/config';
import { Link } from 'react-router-dom';

const DashboardNotificationPreview = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/dashboard/recent-activity')
      .then(res => {
        const items = (res.data?.activities || []).map((act, i) => ({
          id: act.id,
          title: act.title,
          desc: act.desc,
          time: act.time,
          category: act.category,
          accent: act.accent || '#3B82F6',
          priority: i === 0
        }));
        setNotifications(items.slice(0, 4));
      })
      .catch(err => console.error('Notifications fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      className="rounded-2xl border shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)] flex flex-col h-full overflow-hidden"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div className="p-3 md:p-4 border-b flex items-center justify-between bg-[var(--admin-surface-raised)]"
        style={{ borderColor: 'var(--admin-border)' }}>
        <div className="flex items-center gap-2">
          <MdNotificationsActive size={18} className="text-[#3B82F6]" />
          <h2 className="text-sm font-bold admin-text-primary">System Alerts</h2>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EF4444] text-white">
          {notifications.filter(n => n.priority).length} New
        </span>
      </div>

      <div className="p-2 flex-1 overflow-y-auto" style={{ maxHeight: '320px' }}>
        {loading ? (
          <div className="p-4 text-center admin-text-muted text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center admin-text-muted text-sm">No alerts right now.</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative p-2.5 rounded-xl border flex gap-3 transition-colors hover:bg-[var(--admin-surface-raised)] cursor-pointer group"
                style={{
                  borderColor: notif.priority ? `${notif.accent}40` : 'transparent',
                  background: notif.priority ? `${notif.accent}08` : 'transparent'
                }}
              >
                {notif.priority && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-xl" style={{ background: notif.accent }} />
                )}
                <div className="mt-0.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: notif.priority ? notif.accent : 'var(--admin-border)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-2 mb-0.5">
                    <p className={`text-xs font-bold truncate ${notif.priority ? 'admin-text-primary' : 'admin-text-secondary'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[9px] font-medium admin-text-muted shrink-0 tabular-nums whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-[11px] admin-text-muted line-clamp-1">{notif.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t mt-auto" style={{ borderColor: 'var(--admin-border)' }}>
        <Link to="/dashboard/admin/notifications" className="w-full py-2 text-[11px] font-bold uppercase tracking-wider text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5">
          View All Alerts <MdArrowForward size={14} />
        </Link>
      </div>
    </section>
  );
};

export default DashboardNotificationPreview;
