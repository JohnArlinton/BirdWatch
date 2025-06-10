import { useState } from 'react';
import { Search as SearchIcon, X, Filter, FileType, Image, Film, Music, Bird, Link } from 'lucide-react';
import { MediaFile, SearchQuery } from '../types';
import { searchMedia } from '../services/mediaService';
import axios from 'axios';

interface TagInputProps {
  name: string;
  count: number;
  onRemove: () => void;
  onChange: (name: string, count: number) => void;
}

const TagInput = ({ name, count, onRemove, onChange }: TagInputProps) => {
  return (
    <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-md">
      <input
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value, count)}
        className="bg-transparent border-none p-0 text-sm text-green-900 focus:outline-none w-24"
        placeholder="Tag name"
      />
      <span className="text-gray-400">:</span>
      <input
        type="number"
        min="1"
        value={count}
        onChange={(e) => onChange(name, parseInt(e.target.value) || 1)}
        className="bg-transparent border-none p-0 text-sm text-green-900 focus:outline-none w-12"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

type SearchType = 'tags' | 'species' | 'thumbnail';

interface SearchResult {
  thumbnail_url: string;
  full_image_url?: string;
}

const Search = () => {
  const [activeTab, setActiveTab] = useState<SearchType>('tags');
  const [tagFilters, setTagFilters] = useState<{ name: string; count: number }[]>([
    { name: '', count: 1 }
  ]);
  const [speciesInput, setSpeciesInput] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [results, setResults] = useState<MediaFile[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleAddTag = () => {
    setTagFilters([...tagFilters, { name: '', count: 1 }]);
  };
  
  const handleRemoveTag = (index: number) => {
    setTagFilters(tagFilters.filter((_, i) => i !== index));
  };
  
  const handleTagChange = (index: number, name: string, count: number) => {
    const newFilters = [...tagFilters];
    newFilters[index] = { name, count };
    setTagFilters(newFilters);
  };
  
  const handleSearch = async () => {
    if (activeTab === 'tags') {
      // Use new API for tags search
      const validTags = tagFilters.filter(tag => tag.name.trim() !== '');
      if (validTags.length === 0) return;
      
      setIsSearching(true);
      
      try {
        // Build the search payload - use the first valid tag for now
        const searchPayload: { [key: string]: number } = {};
        validTags.forEach(tag => {
          searchPayload[tag.name] = tag.count;
        });
        
        // Using the configured proxy to handle CORS
        const response = await axios.post('/api/search', searchPayload);
        
        // Process search results and fetch full image URLs
        const searchData = response.data;
        const resultsWithFullImages: SearchResult[] = [];
        
        // Check if the response has a links array
        if (searchData && searchData.links && Array.isArray(searchData.links)) {
          for (const thumbnailUrl of searchData.links) {
            // Clean up the URL string (remove backticks and extra quotes)
            const cleanUrl = typeof thumbnailUrl === 'string' 
              ? thumbnailUrl.replace(/[\s`"']+/g, '').trim()
              : thumbnailUrl?.url || '';
            
            if (cleanUrl) {
              try {
                console.log('Fetching full image for thumbnail:', cleanUrl);
                // Get full image URL
                // Using the configured proxy to handle CORS
                const fullImageResponse = await axios.post('/api/get-full', { thumbnail_url: cleanUrl });
                
                console.log('Full image response:', fullImageResponse.data);
                
                // Handle different response formats
                let fullImageUrl = '';
                if (typeof fullImageResponse.data === 'string') {
                  fullImageUrl = fullImageResponse.data;
                } else if (fullImageResponse.data && fullImageResponse.data.full_image_url) {
                  fullImageUrl = fullImageResponse.data.full_image_url;
                } else if (fullImageResponse.data && fullImageResponse.data.url) {
                  fullImageUrl = fullImageResponse.data.url;
                }
                
                resultsWithFullImages.push({
                  thumbnail_url: cleanUrl,
                  full_image_url: fullImageUrl
                });
              } catch (error) {
                console.error('Failed to get full image URL for:', cleanUrl, error);
                resultsWithFullImages.push({
                  thumbnail_url: cleanUrl
                });
              }
            }
          }
        }
        
        setSearchResults(resultsWithFullImages);
        setHasSearched(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    } else if (activeTab === 'species') {
      // Use the species search endpoint
      if (!speciesInput.trim()) return;
      
      setIsSearching(true);
      
      try {
        // Build the search payload for species
        const searchPayload = {
          species: speciesInput.trim()
        };
        
        // Call the species search endpoint
        // Using the configured proxy to handle CORS
        const response = await axios.post('/api/species', searchPayload);
        
        // Process search results and fetch full image URLs
        const searchData = response.data;
        const resultsWithFullImages: SearchResult[] = [];
        
        // Check if the response has a links array
        if (searchData && searchData.links && Array.isArray(searchData.links)) {
          for (const thumbnailUrl of searchData.links) {
            // Clean up the URL string (remove backticks and extra quotes)
            const cleanUrl = typeof thumbnailUrl === 'string' 
              ? thumbnailUrl.replace(/[\s`"']+/g, '').trim()
              : thumbnailUrl?.url || '';
            
            if (cleanUrl) {
              try {
                console.log('Fetching full image for thumbnail:', cleanUrl);
                // Get full image URL using the same endpoint as tags search
                // Using the configured proxy to handle CORS
                const fullImageResponse = await axios.post('/api/get-full', { thumbnail_url: cleanUrl });
                
                console.log('Full image response:', fullImageResponse.data);
                
                // Handle different response formats
                let fullImageUrl = '';
                if (typeof fullImageResponse.data === 'string') {
                  fullImageUrl = fullImageResponse.data;
                } else if (fullImageResponse.data && fullImageResponse.data.full_image_url) {
                  fullImageUrl = fullImageResponse.data.full_image_url;
                } else if (fullImageResponse.data && fullImageResponse.data.url) {
                  fullImageUrl = fullImageResponse.data.url;
                }
                
                resultsWithFullImages.push({
                  thumbnail_url: cleanUrl,
                  full_image_url: fullImageUrl
                });
              } catch (error) {
                console.error('Failed to get full image URL for:', cleanUrl, error);
                resultsWithFullImages.push({
                  thumbnail_url: cleanUrl
                });
              }
            }
          }
        }
        
        setSearchResults(resultsWithFullImages);
        setHasSearched(true);
      } catch (error) {
        console.error('Species search failed:', error);
      } finally {
        setIsSearching(false);
      }
    } else if (activeTab === 'thumbnail') {
      // Use the thumbnail URL search endpoint
      if (!thumbnailUrl.trim()) return;
      
      setIsSearching(true);
      
      try {
        // Build the search payload for thumbnail URL search
        const searchPayload = {
          thumbnail_url: thumbnailUrl.trim()
        };
        
        console.log('Searching by thumbnail URL:', thumbnailUrl.trim());
        
        // Call the get-full endpoint to get the full image URL
        // Using the configured proxy to handle CORS
        const response = await axios.post('/api/get-full', searchPayload);
        
        console.log('Thumbnail search response:', response.data);
        
        // Handle different response formats
        let fullImageUrl = '';
        if (typeof response.data === 'string') {
          fullImageUrl = response.data;
        } else if (response.data && response.data.full_image_url) {
          fullImageUrl = response.data.full_image_url;
        } else if (response.data && response.data.url) {
          fullImageUrl = response.data.url;
        }
        
        // Create a single result with the thumbnail URL and full image URL
        const resultsWithFullImages: SearchResult[] = [
          {
            thumbnail_url: thumbnailUrl.trim(),
            full_image_url: fullImageUrl
          }
        ];
        
        setSearchResults(resultsWithFullImages);
        setHasSearched(true);
      } catch (error) {
        console.error('Thumbnail search failed:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      // Use existing implementation for other search types
      const query: SearchQuery = {};
      
      switch (activeTab) {
        default:
          return;
      }
      
      setIsSearching(true);
      
      try {
        const searchResults = await searchMedia(query);
        setResults(searchResults.files);
        setHasSearched(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };
  
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <Film className="h-6 w-6 text-red-500" />;
      case 'audio':
        return <Music className="h-6 w-6 text-purple-500" />;
      default:
        return <FileType className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const isSearchValid = () => {
    switch (activeTab) {
      case 'tags':
        return tagFilters.some(tag => tag.name.trim() !== '');
      case 'species':
        return speciesInput.trim() !== '';
      case 'thumbnail':
        return thumbnailUrl.trim() !== '';
      default:
        return false;
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Media</h1>
        <p className="mt-1 text-gray-500">
          Find bird media by specifying tags and minimum counts
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('tags')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tags'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Filter className="inline-block w-4 h-4 mr-2" />
              Search by Tags
            </button>
            <button
              onClick={() => setActiveTab('species')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'species'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bird className="inline-block w-4 h-4 mr-2" />
              Search by Species
            </button>
            <button
              onClick={() => setActiveTab('thumbnail')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'thumbnail'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Link className="inline-block w-4 h-4 mr-2" />
              Search by Thumbnail URL
            </button>
          </nav>
        </div>
        
        {/* Search Content */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-4">
            {/* Tags Search */}
            {activeTab === 'tags' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Search by Tags
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Add tags and specify minimum counts (e.g., "crow: 2" finds media with at least 2 crow tags)
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tagFilters.map((tag, index) => (
                    <TagInput
                      key={index}
                      name={tag.name}
                      count={tag.count}
                      onRemove={() => handleRemoveTag(index)}
                      onChange={(name, count) => handleTagChange(index, name, count)}
                    />
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Add Tag
                  </button>
                </div>
              </>
            )}
            
            {/* Species Search */}
            {activeTab === 'species' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Search by Bird Species
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter bird species names separated by commas (e.g., "crow, eagle, robin")
                  </p>
                </div>
                
                <div>
                  <input
                    type="text"
                    value={speciesInput}
                    onChange={(e) => setSpeciesInput(e.target.value)}
                    placeholder="Enter species names (e.g., crow, eagle, robin)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </>
            )}
            
            {/* Thumbnail URL Search */}
            {activeTab === 'thumbnail' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Search by Thumbnail URL
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the S3 URL of a thumbnail to find the corresponding full-size image
                  </p>
                </div>
                
                <div>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="Enter thumbnail S3 URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </>
            )}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !isSearchValid()}
                className="btn btn-primary flex items-center"
              >
                {isSearching ? (
                  <>
                    <span className="animate-spin mr-2">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {hasSearched && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Results: {activeTab === 'tags' || activeTab === 'species' || activeTab === 'thumbnail' ? searchResults.length : results.length} {(activeTab === 'tags' || activeTab === 'species' || activeTab === 'thumbnail' ? searchResults.length : results.length) === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setResults([]);
                setSearchResults([]);
                setHasSearched(false);
                // Reset all search inputs
                setTagFilters([{ name: '', count: 1 }]);
                setSpeciesInput('');
                setThumbnailUrl('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Results
            </button>
          </div>
        )}
        
        {hasSearched && (
          <div className="p-6">
            {(activeTab === 'tags' || activeTab === 'species' || activeTab === 'thumbnail' ? searchResults.length === 0 : results.length === 0) ? (
              <div className="text-center py-8">
                <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or upload more media.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'tags' || activeTab === 'species' || activeTab === 'thumbnail' ? (
                  // Display results from new API
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.map((result, index) => (
                      <div key={index} className="card group">
                        <div className="p-3 pb-0">
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-900">Thumbnail:</p>
                            <p className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                              {typeof result.thumbnail_url === 'string' ? result.thumbnail_url : JSON.stringify(result.thumbnail_url)}
                            </p>
                          </div>
                        </div>
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative mx-3 mt-2 rounded overflow-hidden">
                          <div className="hidden flex items-center justify-center h-40 bg-gray-200">
                            <Image className="h-12 w-12 text-gray-400" />
                          </div>
                        </div>
                        {result.full_image_url && (
                          <div className="flex justify-center mx-3 mt-2">
                            <a 
                              href={typeof result.full_image_url === 'string' ? result.full_image_url : '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-primary text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4 whitespace-nowrap font-medium rounded shadow-md hover:shadow-lg w-full text-center"
                            >
                              View Full Image
                            </a>
                          </div>
                        )}
                        <div className="p-3 pt-2">
                          <div className="space-y-4">
                            
                            {result.full_image_url && (
                              <div>
                                <p className="text-sm font-medium text-gray-900">Full Image:</p>
                                <div className="mt-2">
                                  <img 
                                    src={typeof result.full_image_url === 'string' ? result.full_image_url : ''} 
                                    alt={`Full image ${index + 1}`}
                                    className="w-full rounded border border-gray-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const errorMsg = document.createElement('p');
                                      errorMsg.className = 'text-xs text-red-500 mt-1';
                                      errorMsg.textContent = 'Failed to load full image';
                                      target.parentNode?.appendChild(errorMsg);
                                    }}
                                  />
                                </div>
                                {/* Full image URL hidden as requested */}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Display results from existing API
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map((file) => (
                      <div key={file.id} className="card group">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                          {file.fileType === 'image' ? (
                            <img 
                              src={file.thumbnailUrl || file.fileUrl} 
                              alt={file.fileName}
                              className="object-cover w-full h-40"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-40 bg-gray-200">
                              {getFileTypeIcon(file.fileType)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <a 
                              href={file.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-primary text-sm py-1"
                            >
                              View File
                            </a>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium truncate">{file.fileName}</p>
                            <div className="ml-2 flex-shrink-0">
                              {getFileTypeIcon(file.fileType)}
                            </div>
                          </div>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;