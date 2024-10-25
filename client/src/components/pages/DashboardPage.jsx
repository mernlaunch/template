import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function DashboardPage() {
  const [testData, setTestData] = useState(null);

  async function getTestData() {
    try {
      const response = await api.getTestData();
      setTestData(response.message);

    } catch (e) {
      if (e.message === 'Unauthorized') {
        window.location.href = '/sign-in';
        return;
      }
      alert(e);
    }
  }

  async function handleSignOut() {
    try {
      await api.deauthenticate();
      window.location.href = '/';
    } catch (e) {
      alert(e);
    }
  }

  useEffect(() => {
    getTestData();
  }, []);

  return (
    <>
      <h1>Dashboard</h1>
      <p>{testData}</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </>
  );
};
