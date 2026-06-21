import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AdminRoute = () => {
  const hasStoredSession = Boolean(localStorage.getItem('lms_token')) && localStorage.getItem('role') === 'admin';
  const [access, setAccess] = useState(hasStoredSession ? 'checking' : 'denied');

  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (!token || localStorage.getItem('role') !== 'admin') return;

    const controller = new AbortController();
    fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || payload.data?.role !== 'admin') throw new Error('Invalid admin session');
        setAccess('allowed');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        localStorage.removeItem('role');
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        setAccess('denied');
      });

    return () => controller.abort();
  }, []);

  if (access === 'checking') {
    return <div className="min-h-screen grid place-items-center text-sm text-slate-500" role="status">Verifying secure admin session…</div>;
  }

  return access === 'allowed' ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default AdminRoute;
