import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

/**
 * Higher-order component for protecting routes
 * Verifies user authentication before rendering children
 * Used by [`DashboardPage`](client/src/components/pages/DashboardPage.jsx)
 * All pages that use protected routes should be wrapped in this component
 * 
 * @param {ReactNode} children - Components to render if authenticated
 */
export default function ProtectedPage({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status when component mounts
    async function checkAuth() {
      try {
        // Call isAuthenticated endpoint via [`api.isAuthenticated`](client/src/services/api.js)
        const { isAuthenticated } = await api.isAuthenticated();

        // Redirect to sign in if not authenticated
        if (!isAuthenticated) {
          navigate('/sign-in');
          return;
        }

        // Allow render of protected content
        setLoading(false);
      } catch (e) {
        console.error('Auth check failed:', e);
        navigate('/sign-in');
      }
    }
    checkAuth();
  }, [navigate]);

  // Show nothing while checking auth status
  if (loading) {
    return;
  }

  // Render protected content
  return children;
}
