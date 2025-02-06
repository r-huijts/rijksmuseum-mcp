import axios, { AxiosInstance } from 'axios';
import { 
  ArtworkSearchResult, 
  ArtworkDetails, 
  ImageTiles, 
  UserSet, 
  UserSetDetails,
  TimelineArtwork,
  SearchArtworkArguments
} from '../types.js';

export class RijksmuseumApiClient {
  private axiosInstance: AxiosInstance;
  private readonly BASE_URL = 'https://www.rijksmuseum.nl/api';
  private readonly ENDPOINTS = {
    COLLECTION: 'collection'
  };

  constructor(apiKey: string) {
    this.axiosInstance = axios.create({
      baseURL: this.BASE_URL,
      params: {
        key: apiKey,
        format: 'json'
      }
    });
  }

  async searchArtworks(params: SearchArtworkArguments): Promise<ArtworkSearchResult[]> {
    // Validate page and pageSize constraints
    const p = params.p ?? 0;
    const ps = params.ps ?? 10;
    
    if (p * ps > 10000) {
      throw new Error('Page * pageSize cannot exceed 10,000');
    }

    // Build API parameters
    const apiParams: Record<string, any> = {
      p,
      ps,
      culture: params.culture ?? 'en'
    };

    // Add optional parameters if they exist
    if (params.q) apiParams.q = params.q;
    if (params.involvedMaker) apiParams.involvedMaker = encodeURIComponent(params.involvedMaker);
    if (params.type) apiParams.type = params.type;
    if (params.material) apiParams.material = params.material;
    if (params.technique) apiParams.technique = params.technique;
    if (params.century) apiParams['f.dating.period'] = params.century;
    if (params.color) apiParams['f.normalized32Colors.hex'] = params.color.replace('#', '');
    if (params.imgonly !== undefined) apiParams.imgonly = params.imgonly;
    if (params.toppieces !== undefined) apiParams.toppieces = params.toppieces;
    if (params.sortBy) apiParams.s = params.sortBy;

    const response = await this.axiosInstance.get(`${params.culture ?? 'en'}/${this.ENDPOINTS.COLLECTION}`, {
      params: apiParams
    });

    if (!response.data.artObjects) {
      throw new Error('Invalid response from Rijksmuseum API');
    }

    return response.data.artObjects;
  }

  async getArtworkDetails(objectNumber: string): Promise<ArtworkDetails> {
    const response = await this.axiosInstance.get(`${this.ENDPOINTS.COLLECTION}/${objectNumber}`);
    return response.data;
  }

  async getArtworkImageTiles(objectNumber: string): Promise<ImageTiles> {
    const response = await this.axiosInstance.get(`${this.ENDPOINTS.COLLECTION}/${objectNumber}/tiles`);
    return response.data;
  }

  async getUserSets(page: number = 0, pageSize: number = 10): Promise<UserSet[]> {
    const response = await this.axiosInstance.get('usersets', {
      params: { page, pageSize }
    });
    return response.data;
  }

  async getUserSetDetails(setId: string): Promise<UserSetDetails> {
    const response = await this.axiosInstance.get(`usersets/${setId}`);
    return response.data;
  }

  async getArtistTimeline(artist: string, maxWorks: number = 10): Promise<TimelineArtwork[]> {
    const response = await this.axiosInstance.get(this.ENDPOINTS.COLLECTION, {
      params: {
        involvedMaker: artist,
        ps: maxWorks,
        s: 'chronologic',
        imgonly: true
      }
    });

    return response.data.artObjects.map((artwork: ArtworkSearchResult) => ({
      year: artwork.longTitle.match(/\d{4}/)?.[0] || "Unknown",
      title: artwork.title,
      objectNumber: artwork.objectNumber,
      description: artwork.longTitle,
      image: artwork.webImage ? artwork.webImage.url : null
    }));
  }
} 