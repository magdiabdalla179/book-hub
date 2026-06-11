import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, user, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (user?.isSuspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900 text-center p-6">
        <div className="glass-dark p-8 max-w-md w-full">
          <h2 className="text-2xl font-display font-bold text-red-500 mb-4">Account Suspended</h2>
          <p className="text-surface-300 mb-6">
            Your account has been suspended by an administrator. Please contact support@bookhub.rw for more information.
          </p>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="btn-outline w-full"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
