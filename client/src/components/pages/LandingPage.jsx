import React from 'react';
import api from '../../services/api';

export default function LandingPage() {

  async function handleSignUpClick() {
    try {
      const data = await api.createCheckoutSession();
      window.location.href = data.checkoutUrl;

    } catch (e) {
      alert(e);
    }
  }

  return (
    <>
      <h1>Landing Page</h1>
      <button onClick={handleSignUpClick}>Sign Up</button>
      <button onClick={() => window.location.href = '/sign-in'}>Sign In</button>
    </>
  );
};
