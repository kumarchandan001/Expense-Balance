// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApprovalRulesPage from './pages/ApprovalRulesPage'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<EmployeeDashboard />} />
      <Route path="/manager" element={<ManagerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} /> {/* Add this new route */}
        <Route path="/admin/rules" element={<ApprovalRulesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}

export default App;