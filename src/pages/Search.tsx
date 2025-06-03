import { useState } from 'react';
import { Search as SearchIcon, X, Filter, FileType, Image, Film, Music } from 'lucide-react';
import { MediaFile, SearchQuery } from '../types';
import { searchMedia } from '../services/mediaService';

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

const Search = () => {
  const [tagFilters, setTagFilters] = useState<{ name: string; count: number }[]>([
    { name: '', count: 1 }
  ]);
  const [results, setResults] = useState<MediaFile[]>([]);
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
    // Filter out empty tag names
    const validTags = tagFilters.filter(tag => tag.name.trim() !== '');
    
    if (validTags.length === 0) return;
    
    const query: SearchQuery = {
      tags: {}
    };
    
    // Transform to the format expected by the API
    validTags.forEach(tag => {
      query.tags[tag.name] = tag.count;
    });
    
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
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Media</h1>
        <p className="mt-1 text-gray-500">
          Find bird media by specifying tags and minimum counts
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-4">
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
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || tagFilters.every(tag => tag.name.trim() === '')}
                className="btn btn-primary flex items-center"
              >
                {isSearching ? (
                  <>
                    <span className="animate-spin mr-2">
                      <svg className="h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                        <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
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
                Results: {results.length} {results.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setResults([]);
                setHasSearched(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Results
            </button>
          </div>
        )}
        
        {hasSearched && (
          <div className="p-6">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or upload more media.
                </p>
              </div>
            ) : (
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
    </div>
  );
};

export default Search;