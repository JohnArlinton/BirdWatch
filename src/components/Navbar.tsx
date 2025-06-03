import { useAuth } from 'react-oidc-context';
import { Link } from 'react-router-dom';
import { Menu, Bird, LogOut } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const auth = useAuth();
  const user = auth.user?.profile;

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
      // Fallback: force reload to clear state
      window.location.href = '/login';
    }
  };

  return (
    <header className="bg-green-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              type="button"
              className="md:hidden p-2 rounded-md text-white"
              onClick={onMenuClick}
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            
            <Link to="/dashboard" className="flex items-center ml-2 md:ml-0">
              <Bird className="h-8 w-8 text-green-300" />
              <span className="ml-2 text-xl font-semibold">BirdWatch</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {user && (
              <div className="hidden md:flex items-center mr-4">
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {user.name || user.email}
                </span>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className="flex items-center p-2 rounded-md hover:bg-green-700 transition-colors"
              aria-label="Logout"
            >
              <LogOut size={20} />
              <span className="ml-1 hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;