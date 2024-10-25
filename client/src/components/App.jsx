import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/payment-success' element={<PaymentSuccessPage />} />
        <Route path='/sign-in' element={<SignInPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}
