import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

export function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center" role="status"><Loader2 className="h-7 w-7 animate-spin text-primary" /><span className="sr-only">Checking account access</span></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles?.length && (!user || !roles.includes(user.role))) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
