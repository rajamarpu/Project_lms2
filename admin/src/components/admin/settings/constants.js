import {
  MdPerson,
  MdLock,
  MdNotifications,
  MdPalette,
  MdBusiness,
  MdPayment,
  MdUpdate,
  MdSchool,
  MdCreditCard,
  MdWorkspacePremium,
  MdVideocam,
} from 'react-icons/md';

export const SETTINGS_STORAGE_KEY = 'admin-settings';
export const ACCENT_STORAGE_KEY = 'admin-accent';

export const TABS = [
  { id: 'profile', label: 'Profile', icon: MdPerson, color: '#3B82F6', rgb: '59,130,246' },
  { id: 'security', label: 'Security', icon: MdLock, color: '#EF4444', rgb: '239,68,68' },
  { id: 'notifications', label: 'Notifications', icon: MdNotifications, color: '#EF4444', rgb: '239,68,68' },
  { id: 'appearance', label: 'Appearance', icon: MdPalette, color: '#8B5CF6', rgb: '139,92,246' },
  { id: 'platform', label: 'Platform', icon: MdBusiness, color: '#06B6D4', rgb: '6,182,212' },
  { id: 'billing', label: 'Billing', icon: MdPayment, color: '#10B981', rgb: '16,185,129' },
];

export const ACCENT_PRESETS = [
  { id: 'blue', label: 'Blue', value: '#3B82F6' },
  { id: 'teal', label: 'Teal', value: '#14B8A6' },
  { id: 'red', label: 'Red', value: '#EF4444' },
];

export const NOTIFICATION_CATEGORIES = [
  {
    key: 'platformUpdates',
    label: 'Platform Updates',
    description: 'Product releases, maintenance windows, and system announcements.',
    icon: MdUpdate,
    color: '#3B82F6',
    rgb: '59,130,246',
  },
  {
    key: 'courseAlerts',
    label: 'Course Alerts',
    description: 'New enrollments, course publishes, and curriculum changes.',
    icon: MdSchool,
    color: '#8B5CF6',
    rgb: '139,92,246',
  },
  {
    key: 'payments',
    label: 'Payments',
    description: 'Successful payments, refunds, and billing exceptions.',
    icon: MdCreditCard,
    color: '#10B981',
    rgb: '16,185,129',
  },
  {
    key: 'certificates',
    label: 'Certificates',
    description: 'Issued certificates and completion milestones.',
    icon: MdWorkspacePremium,
    color: '#3B82F6',
    rgb: '59,130,246',
  },
  {
    key: 'liveClasses',
    label: 'Live Classes',
    description: 'Session reminders, cancellations, and attendance updates.',
    icon: MdVideocam,
    color: '#EF4444',
    rgb: '239,68,68',
  },
];

export const DEFAULT_SETTINGS = {
  profile: {
    name: 'Super Admin',
    email: 'admin@uptoskills.com',
    phone: '+91 9876543210',
    role: 'Super Administrator',
    avatar: null,
    lastUpdated: 'Today',
  },
  quickPrefs: {
    themeShortcut: true,
    language: 'English (India)',
    timezone: 'Asia/Kolkata (IST)',
    accentId: 'blue',
  },
  notifPrefs: {
    platformUpdates: true,
    courseAlerts: true,
    payments: true,
    certificates: false,
    liveClasses: true,
  },
  platform: {
    platformName: 'UpToSkills',
    supportEmail: 'support@uptoskills.com',
    language: 'English (India)',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
  },
  billing: {
    plan: 'Enterprise',
    nextBilling: 'Jun 30, 2025',
    amount: '₹24,999/month',
    autoRenew: true,
    invoiceEmail: 'billing@uptoskills.com',
  },
  security: {
    twoFactorEnabled: false,
    strongPassword: true,
    recentLogin: true,
  },
  appearancePrefs: {
    compact: false,
    animations: true,
  },
};

export function computeProfileCompletion(profile) {
  const fields = [profile.name, profile.email, profile.phone, profile.role];
  const filled = fields.filter((f) => f && String(f).trim()).length;
  const hasAvatar = Boolean(profile.avatar);
  return Math.round(((filled / fields.length) * 85 + (hasAvatar ? 15 : 0)));
}

export function computeSecurityScore(security) {
  let score = 77;
  if (security.twoFactorEnabled) score += 12;
  if (security.strongPassword) score += 8;
  if (security.recentLogin) score += 7;
  return Math.min(score, 100);
}

export function computeNotificationStatus(notifPrefs) {
  const values = Object.values(notifPrefs);
  const on = values.filter(Boolean).length;
  if (on === values.length) return { label: 'All On', tone: 'success' };
  if (on === 0) return { label: 'Muted', tone: 'muted' };
  return { label: `${on}/${values.length} Active`, tone: 'partial' };
}
