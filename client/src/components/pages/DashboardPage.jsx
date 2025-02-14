import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProtectedPage from '../ProtectedPage';

/**
 * Protected dashboard page component
 * Only accessible to authenticated users via [`ProtectedPage`](client/src/components/ProtectedPage.jsx)
 * Displays test data from protected API endpoint
 */
export default function DashboardPage() {
  const [testData, setTestData] = useState(null);
  const navigate = useNavigate();

  /**
   * Fetches test data from protected endpoint
   * Uses [`api.getTestData`](client/src/services/api.js)
   */
  async function getTestData() {
    try {
      const response = await api.getTestData();
      setTestData(response.message);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Handles sign out button click
   * Uses [`api.deauthenticate`](client/src/services/api.js)
   */
  async function handleSignOut() {
    try {
      await api.deauthenticate();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  }

  // Fetch test data on component mount
  useEffect(() => {
    getTestData();
  }, []);

  return (
    <ProtectedPage>
      <h1>Dashboard</h1>
      <p>{testData}</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </ProtectedPage>
  );
}
