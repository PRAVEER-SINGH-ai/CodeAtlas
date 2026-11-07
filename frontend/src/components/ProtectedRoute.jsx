import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Wait until the saved session has been restored.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <p className="text-sm font-semibold text-slate-500">
            Restoring your CodeAtlas session...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
