import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthRedirect from '~/routes/useAuthRedirect';
import { Spinner } from '@librechat/client';

// Import your actual Login component
// import Login from '~/components/Auth/Login';

export default function LoginWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthRedirect();

  const returnTo = searchParams.get('returnTo') || '/mini/new';

  useEffect(() => {
    // If user is already authenticated, redirect to the return path
    if (isAuthenticated) {
      console.log('User authenticated, redirecting to:', returnTo);
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, returnTo, navigate]);

  // If already authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center" aria-live="polite" role="status">
        <Spinner className="text-text-primary" />
      </div>
    );
  }

  // Render your actual login component here
  // Option 1: Use your existing Login component
  // return <Login onLoginSuccess={() => navigate(returnTo)} />;

  // Option 2: Use iframe to main login page
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src={`http://localhost:3081/login?returnTo${encodeURIComponent(returnTo)}`}
        title="login"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  );
}

