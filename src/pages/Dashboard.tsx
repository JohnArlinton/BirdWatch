import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Link } from 'react-router-dom';
import { Upload, Search, Tags, Clock, FileType } from 'lucide-react';
import { MediaFile } from '../types';
import { fetchRecentUploads } from '../services/mediaService';

const Dashboard = () => {
  const auth = useAuth();
  const [recentUploads, setRecentUploads] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = auth.user?.profile;
  
  useEffect(() => {
    const loadRecentUploads = async () => {
      try {
        // This would normally fetch from your API
        const uploads = await fetchRecentUploads();
        setRecentUploads(uploads);
      } catch (error) {
        console.error('Failed to load recent uploads:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecentUploads();
  }, []);
  
  const quickActions = [
    { 
      title: 'Upload Media',
      description: 'Add new images, videos, or audio recordings',
      icon: <Upload className="h-6 w-6 text-green-600" />,
      path: '/upload',
      color: 'bg-green-50'
    },
    { 
      title: 'Search Collection',
      description: 'Find media by tags or other criteria',
      icon: <Search className="h-6 w-6 text-blue-600" />,
      path: '/search',
      color: 'bg-blue-50'
    },
    { 
      title: 'Manage Tags',
      description: 'Add or remove tags from existing media',
      icon: <Tags className="h-6 w-6 text-yellow-600" />,
      path: '/manage-tags',
      color: 'bg-yellow-50'
    }
  ];
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Bird Enthusiast'}</h1>
            <p className="mt-1 text-gray-500">{user?.email}</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link to="/upload" className="btn btn-primary">
              Upload New Media
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            to={action.path}
            className={`${action.color} p-6 rounded-lg shadow transition-transform hover:translate-y-[-2px]`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500" />
            <h2 className="ml-2 text-lg font-medium text-gray-900">Recent Uploads</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mt-4"></div>
              </div>
            </div>
          ) : recentUploads.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No recent uploads. Start by uploading some bird media!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {recentUploads.map((file) => (
                <div key={file.id} className="card">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    {file.fileType === 'image' ? (
                      <img 
                        src={file.thumbnailUrl || file.fileUrl} 
                        alt={file.fileName}
                        className="object-cover w-full h-40"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-40 bg-gray-200">
                        <FileType className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {file.tags.slice(0, 3).map((tag) => (
                        <span key={tag.name} className="tag">
                          {tag.name}
                        </span>
                      ))}
                      {file.tags.length > 3 && (
                        <span className="tag bg-gray-100 text-gray-800">
                          +{file.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;