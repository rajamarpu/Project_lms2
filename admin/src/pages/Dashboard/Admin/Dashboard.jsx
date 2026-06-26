import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuBookOpen,
  LuGraduationCap,
  LuUsers,
} from 'react-icons/lu';
import { Button, EmptyState, LoadingState, PageShell, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await platformAdminApi.analytics();
      setAnalytics(payload.data);
    } catch (err) {
      setAnalytics(null);
      setError(err.message || 'Dashboard data unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    platformAdminApi.analytics()
      .then((payload) => {
        if (active) setAnalytics(payload.data);
      })
      .catch((err) => {
        if (!active) return;
        setAnalytics(null);
        setError(err.message || 'Dashboard data unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const dashboardCards = analytics ? [
    {
      label: 'Students',
      value: formatCount(analytics.totalLearners),
      icon: LuUsers,
      tone: 'blue',
      delta: `${formatCount(analytics.activeLearners)} approved`,
      footer: 'Learner accounts',
      source: 'Student management',
      path: '/dashboard/admin/students',
      ariaLabel: 'Open student management',
    },
    {
      label: 'Courses',
      value: formatCount(analytics.totalCourses),
      icon: LuBookOpen,
      tone: 'green',
      delta: `${formatCount(analytics.publishedCourses)} published`,
      footer: 'Course catalog',
      source: 'Course catalog',
      path: '/dashboard/admin/courses',
      ariaLabel: 'Open course management',
    },
    {
      label: 'Instructors',
      value: formatCount(analytics.totalInstructors),
      icon: LuGraduationCap,
      tone: 'red',
      delta: `${formatCount(analytics.activeInstructors)} approved`,
      footer: 'Teaching accounts',
      source: 'Instructor management',
      path: '/dashboard/admin/teachers',
      ariaLabel: 'Open instructor management',
    },
  ] : [];

  const hardError = !analytics && error;

  return (
    <PageShell
      eyebrow="Live platform overview"
      title="Dashboard"
      description="Quick access to the core administration areas."
      actions={<div className="flex flex-wrap gap-2"><Button onClick={() => navigate('/dashboard/admin/students')}>Manage students</Button><Button variant="ghost" onClick={() => navigate('/dashboard/admin/courses')}>Manage courses</Button></div>}
    >
      {hardError ? (
        <EmptyState title="Dashboard data unavailable" description={error} action={<Button onClick={load}>Retry</Button>} />
      ) : loading ? (
        <LoadingState label="Loading exact platform metrics" />
      ) : (
        <>
          <StatGrid className="dashboard-primary-metrics">
            {dashboardCards.map((card) => (
              <StatWidget key={card.label} {...card} onClick={() => navigate(card.path)} />
            ))}
          </StatGrid>
          <p className="metrics-timestamp">Database snapshot generated {new Date(analytics.generatedAt).toLocaleString()}</p>
        </>
      )}
    </PageShell>
  );
}
