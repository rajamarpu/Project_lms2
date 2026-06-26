export function publishLearnerNotification({ title, message, type = 'Update', href = '/dashboard' }) {
  try {
    const key = 'lms_user_notifications';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    const notification = {
      id: Date.now(),
      title,
      message,
      type,
      href,
      read: false,
      time: 'Just now',
    };
    localStorage.setItem(key, JSON.stringify([notification, ...current].slice(0, 50)));
    window.dispatchEvent(new CustomEvent('lms:notification', { detail: notification }));
  } catch {
    // Notification mirroring should never interrupt the management action.
  }
}
