// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApprovalRulesPage from './pages/ApprovalRulesPage';
import { useAuth } from './services/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import NavBar from './components/NavBar';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/employee" replace />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/employee" : "/login"} />} />
          
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/rules" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApprovalRulesPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to={isAuthenticated ? "/employee" : "/login"} replace />} />
        </Routes>
      </ErrorBoundary>
    </Box>
  );
}

export default App;