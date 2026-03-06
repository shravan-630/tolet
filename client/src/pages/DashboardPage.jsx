import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OwnerDashboard from './OwnerDashboard';
import TenantDashboard from './TenantDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return user.userType === 'Owner' ? <OwnerDashboard user={user} /> : <TenantDashboard />;
}
