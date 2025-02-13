export default function LandingPage() {
  return (
    <>
      <h1>Check Your Inbox</h1>
      <p>We have emailed you an authentication token that you can use to sign in</p>
      <button onClick={() => window.location.href = '/sign-in'}>Sign In</button>
    </>
  );
};
