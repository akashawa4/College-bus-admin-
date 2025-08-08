import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import DriversPage from './components/drivers/DriversPage';
import BusesPage from './components/buses/BusesPage';
import RoutesPage from './components/routes/RoutesPage';
import ReportsPage from './components/reports/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="buses" element={<BusesPage />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;