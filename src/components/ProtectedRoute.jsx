import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Gates onboarding/home routes behind a real session — mirrors what
// mobile's root _layout.tsx does by checking `user`/`isLoading` before
// ever rendering a screen past the auth stack.
export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
