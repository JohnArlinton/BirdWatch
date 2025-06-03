import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, Search, Tags, FileX } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/upload', label: 'Upload', icon: <Upload size={20} /> },
    { path: '/search', label: 'Search', icon: <Search size={20} /> },
    { path: '/manage-tags', label: 'Manage Tags', icon: <Tags size={20} /> },
  ];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside 
      className={`bg-white shadow-md z-20 ${
        isOpen ? 'fixed inset-y-0 left-0 w-64 transform translate-x-0' : 'fixed inset-y-0 left-0 w-64 transform -translate-x-full'
      } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      <nav className="h-full overflow-y-auto py-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-md transition-colors ${
                  isActive(item.path) 
                    ? 'bg-green-100 text-green-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={isActive(item.path) ? 'text-green-700' : 'text-gray-500'}>
                  {item.icon}
                </span>
                <span className="ml-3 font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;