import axios from 'axios';
import { MediaFile, SearchQuery, SearchResult, TagOperation } from '../types';

// This is a mock implementation that would be replaced with actual API calls
// The base URL for your API Gateway
const API_BASE_URL = 'https://api.example.com';

// Mock data for development purposes
const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    fileName: 'robin.jpg',
    fileType: 'image',
    fileUrl: 'https://images.pexels.com/photos/2115984/pexels-photo-2115984.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/2115984/pexels-photo-2115984.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: [
      { name: 'robin', count: 3 },
      { name: 'bird', count: 1 },
      { name: 'red', count: 2 }
    ],
    uploadDate: new Date().toISOString(),
    userId: 'user123'
  },
  {
    id: '2',
    fileName: 'eagle.jpg',
    fileType: 'image',
    fileUrl: '/src/services/eagle.jpg',
    thumbnailUrl: '/src/services/eagle.jpg',
    tags: [
      { name: 'eagle', count: 4 },
      { name: 'bird', count: 1 },
      { name: 'predator', count: 2 }
    ],
    uploadDate: new Date().toISOString(),
    userId: 'user123'
  },
  {
    id: '3',
    fileName: 'hummingbird.jpg',
    fileType: 'image',
    fileUrl: 'https://images.pexels.com/photos/349758/hummingbird-bird-birds-349758.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/349758/hummingbird-bird-birds-349758.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: [
      { name: 'hummingbird', count: 5 },
      { name: 'bird', count: 1 },
      { name: 'small', count: 2 }
    ],
    uploadDate: new Date().toISOString(),
    userId: 'user123'
  },
  {
    id: '4',
    fileName: 'owl.jpg',
    fileType: 'image',
    fileUrl: 'https://images.pexels.com/photos/86596/owl-bird-eyes-eagle-owl-86596.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/86596/owl-bird-eyes-eagle-owl-86596.jpeg?auto=compress&cs=tinysrgb&w=300',
    tags: [
      { name: 'owl', count: 3 },
      { name: 'bird', count: 1 },
      { name: 'nocturnal', count: 2 }
    ],
    uploadDate: new Date().toISOString(),
    userId: 'user123'
  },
  {
    id: '5',
    fileName: 'bird_call.mp3',
    fileType: 'audio',
    fileUrl: 'https://example.com/bird_call.mp3',
    tags: [
      { name: 'audio', count: 1 },
      { name: 'bird', count: 2 },
      { name: 'call', count: 1 }
    ],
    uploadDate: new Date().toISOString(),
    userId: 'user123'
  }
];

/**
 * Upload a media file to the server
 */
export const uploadMedia = async (file: File): Promise<MediaFile> => {
  try {
    // Step 1: Get presigned URL from API Gateway
    const response = await fetch('https://rxrmfovcg8.execute-api.ap-southeast-2.amazonaws.com/generate-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get presigned URL: ${response.status} ${response.statusText}`);
    }
    
    const { presignedUrl, fileKey } = await response.json();
    
    // Step 2: Upload file directly to S3 using the presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }
    
    // Step 3: Construct the final file URL (assuming standard S3 URL structure)
    const s3FileUrl = presignedUrl.split('?')[0]; // Remove query parameters to get clean S3 URL
    
    // Transform the response to match our MediaFile interface
    return {
      id: fileKey || `${Date.now()}`,
      fileName: file.name,
      fileType: file.type.startsWith('image/') 
        ? 'image' 
        : file.type.startsWith('video/') 
          ? 'video' 
          : 'audio',
      fileUrl: s3FileUrl,
      thumbnailUrl: file.type.startsWith('image/') ? s3FileUrl : undefined,
      tags: [
        { name: 'uploaded', count: 1 },
        { name: 'processing', count: 1 }
      ],
      uploadDate: new Date().toISOString(),
      userId: 'user123'
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Upload failed');
  }
};

/**
 * Search for media files based on tag queries
 */
export const searchMedia = async (query: SearchQuery): Promise<SearchResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock implementation - filter the mock data based on the query
  const filteredFiles = mockMediaFiles.filter(file => {
    // Check if the file has all the requested tags with at least the minimum count
    return Object.entries(query.tags).every(([tagName, minCount]) => {
      const tag = file.tags.find(t => t.name === tagName);
      return tag && tag.count >= minCount;
    });
  });
  
  return {
    files: filteredFiles,
    totalCount: filteredFiles.length
  };
  
  // Real implementation would look something like this:
  /*
  const response = await axios.post(`${API_BASE_URL}/search`, query, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  
  return response.data;
  */
};

/**
 * Update tags for multiple media files
 */
export const updateTags = async (tagOperation: TagOperation): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Mock implementation - just log the operation
  console.log('Tag operation:', tagOperation);
  
  // Real implementation would look something like this:
  /*
  await axios.post(`${API_BASE_URL}/manage-tags`, tagOperation, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  */
};

/**
 * Delete media files
 */
export const deleteMedia = async (fileIds: string[]): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock implementation - just log the operation
  console.log('Delete files:', fileIds);
  
  // Real implementation would look something like this:
  /*
  await axios.delete(`${API_BASE_URL}/delete`, {
    data: { fileIds },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  */
};

/**
 * Fetch recent uploads
 */
export const fetchRecentUploads = async (): Promise<MediaFile[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock implementation - return all mock files
  return mockMediaFiles;
  
  // Real implementation would look something like this:
  /*
  const response = await axios.get(`${API_BASE_URL}/recent-uploads`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  
  return response.data;
  */
};