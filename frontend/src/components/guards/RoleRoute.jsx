import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleRoute = ({ children, role }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If user doesn't have the required role, redirect to home page
  // For multiple roles, we can check if the role is in an array
  if (Array.isArray(role) ? !role.includes(currentUser.role) : currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default RoleRoute;