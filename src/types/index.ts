// Auth types
export interface User {
  email: string;
  name: string;
  picture?: string;
}

// Media types
export interface MediaFile {
  id: string;
  fileName: string;
  fileType: 'image' | 'video' | 'audio';
  fileUrl: string;
  thumbnailUrl?: string;
  tags: Tag[];
  uploadDate: string;
  userId: string;
}

export interface Tag {
  name: string;
  count: number;
}

export interface TagOperation {
  urls: string[];
  tags: string[];
  operation: 'add' | 'remove';
}

export interface DeleteOperation {
  urls: string[];
}

export interface SearchQuery {
  tags?: { [key: string]: number };
  species?: string[];
  thumbnailUrl?: string;
}

export interface SearchResult {
  files: MediaFile[];
  totalCount: number;
}