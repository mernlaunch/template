import { useState } from 'react';
import api from '../../services/api';

/**
 * Sign in page component for token-based authentication
 * Users receive their auth token via email after payment
 * Uses [`api.authenticate`](client/src/services/api.js) for token verification
 */
export default function SignInPage() {
  // Store auth token from input
  const [authToken, setAuthToken] = useState('');

  /**
   * Handles sign in button click
   * Authenticates with token and redirects to dashboard
   */
  async function handleSignInClick() {
    try {
      await api.authenticate(authToken);
      window.location.href = '/dashboard';
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <h1>Sign In Page</h1>
      {/* Password input for auth token */}
      <input
        type='password'
        placeholder='auth-token'
        value={authToken}
        onChange={(e) => setAuthToken(e.target.value)}
      />

      {/* Sign in button, disabled if token empty */}
      <button
        disabled={authToken.length <= 0}
        onClick={handleSignInClick}
      >
        Sign In
      </button>
    </>
  );
}
