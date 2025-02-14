import api from '../../services/api';

/**
 * Landing-page page component
 * Redirects users to a stripe checkout if they click the sign-up button
 */
export default function LandingPage() {

  async function handleSignUpClick() {
    try {
      const data = await api.createCheckoutSession();
      window.location.href = data.checkoutUrl;

    } catch (e) {
      console.error(e);
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
