// Add these new types
export interface ArtworkData {
  id: string;
  title: string;
  artist: string;
  year: string;
  description: string;
  imageUrl: string;
  colors: Array<{
    percentage: number;
    hex: string;
  }>;
  dimensions?: {
    height: number;
    width: number;
    unit: string;
  };
}

export interface SearchParams {
  query?: string;
  artist?: string;
  type?: string;
  century?: number;
  color?: string;
  hasImage?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TimelineArtwork {
  year: string;
  title: string;
  objectNumber: string;
  description: string;
  image: string | null;
}

export interface ArtworkSearchResult {
  id: string;
  objectNumber: string;
  title: string;
  principalOrFirstMaker: string;
  longTitle: string;
  subTitle: string;
  scLabelLine: string;
  location: string;
  webImage?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface SearchArtworkArguments {
  q?: string;
  involvedMaker?: string;
  type?: string;
  material?: string;
  technique?: string;
  century?: number;
  color?: string;
  imgonly?: boolean;
  toppieces?: boolean;
  sortBy?: 'relevance' | 'objecttype' | 'chronologic' | 'achronologic' | 'artist' | 'artistdesc';
  p?: number;
  ps?: number;
  culture?: 'nl' | 'en';
}

export interface ArtworkDetails {
  artObject: {
    id: string;
    objectNumber: string;
    title: string;
    // Add other relevant fields based on the API response
  };
}

export interface ImageTiles {
  levels: Array<{
    name: string;
    width: number;
    height: number;
    tiles: Array<{
      x: number;
      y: number;
      url: string;
    }>;
  }>;
}

export interface UserSet {
  id: string;
  name: string;
  description: string | null;
  count: number;
  // Add other relevant fields
}

export interface UserSetDetails extends UserSet {
  setItems: Array<{
    id: string;
    objectNumber: string;
    // Add other relevant fields
  }>;
}

export interface OpenImageArguments {
  imageUrl: string;
}

export interface Prompt {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
} 