import { Bird } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center">
          <Bird size={60} className="text-green-700 animate-pulse" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-gray-800">Loading BirdWatch</h1>
        <p className="mt-2 text-gray-600">Please wait while we prepare your experience...</p>
        <div className="mt-6">
          <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full animate-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;