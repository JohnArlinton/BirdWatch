import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const auth = useAuth();

  // Close sidebar when route changes (especially on mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // If not authenticated, don't render the layout
  if (!auth.isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;