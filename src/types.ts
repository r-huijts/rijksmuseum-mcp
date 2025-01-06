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