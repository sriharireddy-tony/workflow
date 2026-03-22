import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '@/constants';
import Loader from '@/components/common/Loader';

export default function ProtectedRoute({ children }) {
  const { token, hydrated } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!hydrated) {
    return <Loader fullPage />;
  }
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }
  return children;
}
