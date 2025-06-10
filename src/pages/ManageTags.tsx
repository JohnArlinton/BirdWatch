import { useState } from 'react';
import { Plus, Minus, Save, Trash, AlertCircle, CheckCircle, X } from 'lucide-react';
import { TagOperation } from '../types';
import { updateTags, deleteMedia } from '../services/mediaService';

const ManageTags = () => {
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [operation, setOperation] = useState<'add' | 'remove' | 'delete'>('add');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    
    setUrls([...urls, urlInput.trim()]);
    setUrlInput('');
  };
  
  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };
  
  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    console.log('handleSubmit called with operation:', operation);
    console.log('URLs array:', urls);
    console.log('Tags array:', tags);
    
    if (operation === 'delete') {
      if (urls.length === 0) {
        console.log('No URLs provided for deletion');
        setResult({
          success: false,
          message: 'Please provide at least one URL to delete'
        });
        return;
      }
    } else {
      if (urls.length === 0 || tags.length === 0) {
        console.log('Missing URLs or tags for tag operation');
        setResult({
          success: false,
          message: 'Please provide at least one URL and one tag'
        });
        return;
      }
    }
    
    console.log('Starting processing...');
    setIsProcessing(true);
    setResult(null);
    
    try {
      if (operation === 'delete') {
        console.log('Calling deleteMedia with URLs:', urls);
        await deleteMedia(urls);
        console.log('deleteMedia completed successfully');
        setResult({
          success: true,
          message: 'Successfully deleted the selected media files'
        });
      } else {
        // Format the tag operation according to the API requirements
        // The API expects urls in the 'url' field and tags formatted as 'tag,quantity'
        const tagOperation: TagOperation = {
          urls,
          // For now, we'll use a quantity of 1 for all tags
          // This can be enhanced in the future to allow specifying quantities
          tags,
          operation
        };
        
        // Call the updateTags function which now handles the proper formatting
        const response = await updateTags(tagOperation);
        
        console.log('Tag operation completed:', response);
        
        setResult({
          success: true,
          message: `Successfully ${operation === 'add' ? 'added' : 'removed'} tags from the selected media`
        });
      }
      
      // Clear form
      setUrls([]);
      setTags([]);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process request'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Tags</h1>
        <p className="mt-1 text-gray-500">
          Add or remove tags from existing media files, or delete files entirely
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {result && (
          <div className={`p-4 ${result.success ? 'bg-green-50' : 'bg-red-50'} border-b border-gray-200`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Select Operation</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose whether to add or remove tags from the selected media, or delete files entirely
            </p>
            
            <div className="mt-4 flex space-x-4">
              <button
                type="button"
                onClick={() => setOperation('add')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  operation === 'add'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Tags
              </button>
              
              <button
                type="button"
                onClick={() => setOperation('remove')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  operation === 'remove'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Minus className="mr-2 h-5 w-5" />
                Remove Tags
              </button>
              
              <button
                type="button"
                onClick={() => setOperation('delete')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  operation === 'delete'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Trash className="mr-2 h-5 w-5" />
                Delete Files
              </button>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Step 1: Enter Media URLs</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add the thumbnail URLs of the media files you want to modify
            </p>
            
            <div className="mt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter media URL"
                  className="input flex-1"
                />
                
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  className="btn btn-primary whitespace-nowrap"
                >
                  Add URL
                </button>
              </div>
              
              {urls.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Added URLs ({urls.length})</h3>
                  <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200 max-h-40 overflow-y-auto">
                    {urls.map((url, index) => (
                      <li key={index} className="flex items-center justify-between py-2 px-4 text-sm">
                        <div className="truncate max-w-md">
                          {url}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveUrl(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {operation !== 'delete' && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Step 2: Specify Tags</h2>
              <p className="mt-1 text-sm text-gray-500">
                {operation === 'add'
                  ? 'Add the tags you want to apply to the selected media'
                  : 'Add the tags you want to remove from the selected media'
                }
              </p>
              
              <div className="mt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag"
                    className="input flex-1"
                  />
                  
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="btn btn-primary whitespace-nowrap"
                  >
                    Add Tag
                  </button>
                </div>
                
                {tags.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700">Added Tags ({tags.length})</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-full pl-3 pr-2 py-1">
                          <span className="text-sm font-medium text-gray-900">
                            {tag}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {operation !== 'delete' && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing || urls.length === 0 || tags.length === 0}
                  className="btn btn-primary flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {operation === 'add' ? 'Add Tags' : 'Remove Tags'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {operation === 'delete' && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    console.log('=== DELETE BUTTON CLICKED ===');
                    console.log('URLs to delete:', urls);
                    setIsProcessing(true);
                    setResult(null);
                    
                    deleteMedia(urls)
                      .then(() => {
                        console.log('Delete operation completed successfully');
                        setResult({
                          success: true,
                          message: 'Successfully deleted the selected media files'
                        });
                        setUrls([]);
                      })
                      .catch(error => {
                        console.error('Error in delete operation:', error);
                        setResult({
                          success: false,
                          message: error instanceof Error ? error.message : 'Failed to delete files'
                        });
                      })
                      .finally(() => {
                        setIsProcessing(false);
                      });
                  }}
                  disabled={isProcessing || urls.length === 0}
                  className="btn btn-danger flex items-center bg-red-600 hover:bg-red-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Files
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTags;