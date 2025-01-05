// Add these new types
interface ArtworkData {
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

interface SearchParams {
  query?: string;
  artist?: string;
  type?: string;
  century?: number;
  color?: string;
  hasImage?: boolean;
  page?: number;
  pageSize?: number;
} 