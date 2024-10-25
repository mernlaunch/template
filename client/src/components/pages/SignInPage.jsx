import React from 'react';
import api from '../../services/api';

export default function SignInPage() {
  const [authToken, setAuthToken] = React.useState('');

  async function handleSignInClick() {
    try {
      await api.authenticate(authToken);
      window.location.href = '/dashboard';

    } catch (e) {
      alert(e);
    }
  }

  return (
    <>
      <h1>Sign In Page</h1>
      <input
        type='password'
        placeholder='auth-token'
        value={authToken}
        onChange={(e) => setAuthToken(e.target.value)}
      />

      <button disabled={authToken.length <= 0} onClick={handleSignInClick}>Sign In</button>
    </>
  );
};
