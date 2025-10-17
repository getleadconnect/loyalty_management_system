import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import CustomerDashboard from './components/customer/Dashboard';
import PointsHistory from './components/customer/PointsHistory';
import Redemptions from './components/customer/Redemptions';
import BarcodeScanner from './components/customer/BarcodeScanner';
import Rewards from './components/customer/Rewards';
import AboutUs from './components/customer/AboutUs';
import MyProfile from './components/customer/MyProfile';
import TermsConditions from './components/customer/TermsConditions';
import PrivacyPolicy from './components/customer/PrivacyPolicy';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/Dashboard';
import Customers from './components/admin/Customers';
import RedeemedCustomers from './components/admin/RedeemedCustomers';
import Products from './components/admin/Products';
import RewardsManagement from './components/admin/RewardsManagement';
import Communication from './components/admin/Communication';
import AdsImages from './components/admin/AdsImages';
import Settings from './components/admin/Settings';
import Reports from './components/admin/Reports';
import Users from './components/admin/Users';
import AdminProfile from './components/admin/Profile';
import AdminChangePassword from './components/admin/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="redeemed-customers" element={<RedeemedCustomers />} />
          <Route path="products" element={<Products />} />
          <Route path="rewards" element={<RewardsManagement />} />
          <Route path="communication" element={<Communication />} />
          <Route path="ads-images" element={<AdsImages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="change-password" element={<AdminChangePassword />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        
        {/* Protected Customer Routes */}
        <Route path="/customer/*" element={
          <ProtectedRoute requiredRole="customer">
            <Routes>
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="points" element={<PointsHistory />} />
              <Route path="redemptions" element={<Redemptions />} />
              <Route path="qrcode-scanner" element={<BarcodeScanner />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="terms" element={<TermsConditions />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
            </Routes>
          </ProtectedRoute>
        } />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;