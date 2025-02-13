import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function ProtectedPage({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { isAuthenticated } = await api.isAuthenticated();
        if (!isAuthenticated) {
          navigate('/sign-in');
          return;
        }
        setLoading(false);
      } catch (e) {
        console.error('Auth check failed:', e);
        navigate('/sign-in');
      }
    }
    checkAuth();
  }, [navigate]);

  if (loading) {
    return;
  }

  return children;
}