import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';

/**
 * Root component that handles routing
 * Defines all available routes in the application
 * Protected routes are handled by [`ProtectedPage`](client/src/components/ProtectedPage.jsx)
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing page with signup/signin options */}
        <Route path='/' element={<LandingPage />} />

        {/* Shown after successful Stripe payment */}
        <Route path='/payment-success' element={<PaymentSuccessPage />} />

        {/* Authentication with email token */}
        <Route path='/sign-in' element={<SignInPage />} />

        {/* Protected member dashboard */}
        <Route path='/dashboard' element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}
