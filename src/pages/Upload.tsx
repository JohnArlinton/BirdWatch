import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, FileType, Loader2 } from 'lucide-react';
import { uploadMedia } from '../services/mediaService';

interface FilePreview {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

const Upload = () => {
  const [files, setFiles] = useState<FilePreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      file,
      preview: file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : '',
      progress: 0,
      status: 'idle' as const
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': []
    },
    maxSize: 20 * 1024 * 1024, // 20MB max size
  });

  const handleRemoveFile = (id: string) => {
    setFiles(prev => {
      const filteredFiles = prev.filter(file => file.id !== id);
      
      // Revoke the object URL to avoid memory leaks
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      return filteredFiles;
    });
  };

  const handleUpload = async () => {
    const filesToUpload = files.filter(f => f.status === 'idle');
    
    if (filesToUpload.length === 0) return;
    
    for (const fileData of filesToUpload) {
      // Update status to uploading
      setFiles(prev => 
        prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'uploading' as const } 
            : f
        )
      );
      
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles(prev => 
            prev.map(f => 
              f.id === fileData.id && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 300);
        
        // Upload the file
        await uploadMedia(fileData.file);
        
        clearInterval(progressInterval);
        
        // Update status to success
        setFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'success' as const, progress: 100 } 
              : f
          )
        );
      } catch (error) {
        // Update status to error
        setFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { 
                  ...f, 
                  status: 'error' as const, 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                } 
              : f
          )
        );
      }
    }
  };

  const renderFilePreview = (fileData: FilePreview) => {
    if (fileData.file.type.startsWith('image/') && fileData.preview) {
      return (
        <img 
          src={fileData.preview} 
          alt={fileData.file.name}
          className="h-16 w-16 object-cover rounded"
        />
      );
    }
    
    return (
      <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
        <FileType className="h-8 w-8 text-gray-400" />
      </div>
    );
  };

  const getStatusClass = (status: FilePreview['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'uploading':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Media</h1>
        <p className="mt-1 text-gray-500">
          Upload images, videos, or audio recordings of birds for automatic species tagging.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm font-medium text-gray-900">
              {isDragActive
                ? "Drop the files here..."
                : "Drag & drop files here, or click to select files"
              }
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Support for images, videos, and audio up to 20MB
            </p>
          </div>
        </div>
        
        {files.length > 0 && (
          <div className="border-t border-gray-200">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">
                  Selected Files ({files.length})
                </h3>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!files.some(f => f.status === 'idle')}
                  className="btn btn-primary text-sm py-1"
                >
                  Upload All
                </button>
              </div>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {files.map((fileData) => (
                <li key={fileData.id} className={`p-4 ${getStatusClass(fileData.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {renderFilePreview(fileData)}
                      <div className="ml-4">
                        <p className="text-sm font-medium">{fileData.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(fileData.file.size / 1024 / 1024).toFixed(2)} MB - {fileData.file.type}
                        </p>
                        {fileData.status === 'error' && (
                          <p className="text-xs text-red-600 mt-1">{fileData.error}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {fileData.status === 'uploading' ? (
                        <div className="flex items-center">
                          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                          <span className="ml-2 text-xs">{fileData.progress}%</span>
                        </div>
                      ) : fileData.status === 'success' ? (
                        <span className="text-xs text-green-600">Uploaded</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(fileData.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {fileData.status === 'uploading' && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${fileData.progress}%` }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;