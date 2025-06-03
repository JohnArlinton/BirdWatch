import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bird } from 'lucide-react';

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (auth.isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [auth.isAuthenticated, navigate, location]);
  
  const handleLogin = () => {
    auth.signinRedirect();
  };

  const handleLogout = async () => {
    try {
      // First remove user from local storage
      await auth.removeUser();
      // Then redirect to Cognito logout
      const clientId = '1891fth9eq6mfem6tiu3o2g48';
      const logoutUri = 'http://localhost:3000';
      const cognitoDomain = 'https://us-east-1cxp5bcfnh.auth.us-east-1.amazoncognito.com';
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: just remove user locally
      await auth.removeUser();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <Bird size={60} className="text-green-700" />
          </div>
          
          <h1 className="mt-4 text-center text-3xl font-bold text-gray-900">BirdWatch</h1>
          <p className="mt-2 text-center text-gray-600">
            Your personal bird media collection
          </p>
          
          <div className="mt-8">
            {auth.isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Sign in with AWS Cognito
              </button>
            )}
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-500">
            Securely manage your bird media collection with AWS Cognito authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;