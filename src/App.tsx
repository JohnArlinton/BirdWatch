import { useAuth } from 'react-oidc-context';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Search from './pages/Search';
import ManageTags from './pages/ManageTags';
import NotFound from './pages/NotFound';

function App() {
  const auth = useAuth();

  // Show loading when auth is in progress
  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard\" replace />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/manage-tags" 
          element={
            <ProtectedRoute>
              <ManageTags />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/logout" 
          element={
            <ProtectedRoute>
              <Navigate to="/login\" replace />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;