import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProtectedPage from '../ProtectedPage';

export default function DashboardPage() {
  const [testData, setTestData] = useState(null);
  const navigate = useNavigate();

  async function getTestData() {
    try {
      const response = await api.getTestData();
      setTestData(response.message);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSignOut() {
    try {
      await api.deauthenticate();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  }

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
