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
  let filteredFiles = mockMediaFiles;
  
  // Filter by tags if provided
  if (query.tags && Object.keys(query.tags).length > 0) {
    filteredFiles = filteredFiles.filter(file => {
      // Check if the file has all the requested tags with at least the minimum count
      return Object.entries(query.tags!).every(([tagName, minCount]) => {
        const tag = file.tags.find(t => t.name === tagName);
        return tag && tag.count >= minCount;
      });
    });
  }
  
  // Filter by species if provided
  if (query.species && query.species.length > 0) {
    filteredFiles = filteredFiles.filter(file => {
      // Check if the file has at least one of the specified species
      return query.species!.some(species => 
        file.tags.some(tag => tag.name.toLowerCase() === species.toLowerCase())
      );
    });
  }
  
  // Filter by thumbnail URL if provided
  if (query.thumbnailUrl) {
    filteredFiles = filteredFiles.filter(file => 
      file.thumbnailUrl === query.thumbnailUrl
    );
  }
  
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
  try {
    console.log('updateTags function called with:', tagOperation);
    
    // Convert the operation type to a number (1 for add, 2 for remove)
    const operationCode = tagOperation.operation === 'add' ? 1 : 0;
    console.log('Operation code:', operationCode);
    
    // Format tags as "tag,count" strings
    // For simplicity, we'll use count=1 for all tags
    const formattedTags = tagOperation.tags.map(tag => `${tag},1`);
    console.log('Formatted tags:', formattedTags);
    
    // Clean up URLs (remove any backticks or extra quotes)
    // Log before and after cleaning to debug
    console.log('Original URLs:', tagOperation.urls);
    
    // Enhanced URL cleaning with more detailed logging
    const cleanUrls = tagOperation.urls.map(url => {
      console.log('Processing URL:', url, 'Type:', typeof url);
      if (!url || typeof url !== 'string') {
        console.warn('Invalid URL detected:', url);
        return '';
      }
      
      const cleaned = url.replace(/[\s`"']+/g, '').trim();
      console.log(`Cleaned URL: ${url} -> ${cleaned}`);
      return cleaned;
    }).filter(url => url.length > 0); // Remove any empty URLs
    
    console.log('Clean URLs array:', cleanUrls);
    
    if (cleanUrls.length === 0) {
      throw new Error('No valid URLs provided after cleaning');
    }
    
    // Prepare the request payload
    const requestData = {
      url: cleanUrls,
      operation: operationCode,
      tags: formattedTags
    };
    
    console.log('Sending tag operation:', requestData);
    console.log('Final request data:', JSON.stringify(requestData));
    
    let proxyError = null;
    
    // First try using the proxy endpoint to avoid CORS issues
    // The proxy in vite.config.ts will rewrite /api to the base URL
    // For example: /api/modify-tags -> https://3p5cd1xfp2.execute-api.ap-southeast-2.amazonaws.com/Production/modify-tags
    try {
      console.log('Sending request to proxy endpoint: /api/modify-tags');
      const response = await axios.post('/api/modify-tags', requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        // Add timeout to ensure we don't wait forever
        timeout: 15000 // Increased timeout for potentially slow connections
      });
      
      if (response && response.data) {
        console.log('Tag operation response via proxy:', response.data);
        return response.data;
      }
      
      console.error('No data in response from proxy');
      throw new Error('No data in response from proxy');
      
    } catch (error) {
      console.error('Error making request through proxy:', error);
      proxyError = error;
      // Continue to fallback - don't rethrow yet
    }
    
    // If we get here, the proxy request failed, so try direct API call as a fallback
    console.log('Attempting direct API call as fallback...');
    try {
      const directResponse = await axios.post(
        'https://3p5cd1xfp2.execute-api.ap-southeast-2.amazonaws.com/Production/modify-tags',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000 // Increased timeout for potentially slow connections
        }
      );
      
      if (directResponse && directResponse.data) {
        console.log('Direct API call succeeded:', directResponse.data);
        return directResponse.data;
      }
      
      console.error('No data in response from direct API call');
      throw new Error('No data in response from direct API call');
      
    } catch (directError) {
      console.error('Direct API call also failed:', directError);
      // If both attempts failed, throw the original error if it exists, otherwise throw the direct error
      throw proxyError || directError;
    }
  } catch (error) {
    console.error('Failed to update tags:', error);
    throw error;
  }
};

/**
 * Delete media files
 */
export const deleteMedia = async (fileUrls: string[]): Promise<void> => {
  try {
    console.log('deleteMedia function called with URLs:', fileUrls);
    
    // Clean up URLs (remove any backticks or extra quotes)
    const cleanUrls = fileUrls.map(url => {
      console.log('Processing URL for deletion:', url, 'Type:', typeof url);
      if (!url || typeof url !== 'string') {
        console.warn('Invalid URL detected:', url);
        return '';
      }
      
      const cleaned = url.replace(/[\s`"']+/g, '').trim();
      console.log(`Cleaned URL for deletion: ${url} -> ${cleaned}`);
      return cleaned;
    }).filter(url => url.length > 0); // Remove any empty URLs
    
    console.log('Clean URLs array for deletion:', cleanUrls);
    
    if (cleanUrls.length === 0) {
      throw new Error('No valid URLs provided for deletion');
    }
    
    // Prepare the request payload with only the url field
    const requestData = {
      url: cleanUrls
    };
    
    console.log('Sending delete operation with data:', requestData);
    
    let proxyError = null;
    
    // First try using the proxy endpoint to avoid CORS issues
    // The proxy in vite.config.ts will rewrite /api to the base URL
    try {
      // Make sure we're using the correct endpoint path
      const proxyEndpoint = '/api/delete-files';
      console.log(`Sending request to proxy endpoint: ${proxyEndpoint}`);
      const response = await axios.post(proxyEndpoint, requestData, {
        headers: { 
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        // Add timeout to ensure we don't wait forever
        timeout: 15000 // Increased timeout for potentially slow connections
      });
      
      if (response && response.data) {
        console.log('Delete operation response via proxy:', response.data);
        return response.data;
      }
      
      console.error('No data in response from proxy');
      throw new Error('No data in response from proxy');
      
    } catch (error) {
      console.error(`Error making request through proxy:`, error);
      proxyError = error;
      // Continue to fallback - don't rethrow yet
    }

    // Skip the proxy and directly call the API endpoint
    try {
      // Use the same endpoint path that the proxy would use after rewriting
      const directEndpoint = 'https://3p5cd1xfp2.execute-api.ap-southeast-2.amazonaws.com/Production/delete-files';
      console.log(`Sending delete request directly to API endpoint: ${directEndpoint}`);
      const response = await axios.post(
        directEndpoint,
        requestData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
            'Access-Control-Allow-Origin': window.location.origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Origin'
          },
          // Add timeout to ensure we don't wait forever
          timeout: 15000 // Increased timeout for potentially slow connections
        }
      );
      
      if (response && response.data) {
        console.log('Delete operation response:', response.data);
        return response.data;
      }
      
      console.error('No data in response from API for delete operation');
      throw new Error('No data in response from API for delete operation');
      
    } catch (error) {
      console.error('Error making delete request:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete media:', error);
    throw error;
  }
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