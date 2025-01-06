import axios, { AxiosInstance } from 'axios';
import { 
  ArtworkSearchResult, 
  ArtworkDetails, 
  ImageTiles, 
  UserSet, 
  UserSetDetails,
  TimelineArtwork
} from '../types.js';

export class RijksmuseumApiClient {
  private axiosInstance: AxiosInstance;
  private readonly BASE_URL = 'https://www.rijksmuseum.nl/api/en';
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

  async searchArtworks(query: string, pageSize: number = 10): Promise<ArtworkSearchResult[]> {
    const response = await this.axiosInstance.get(this.ENDPOINTS.COLLECTION, {
      params: {
        q: query,
        ps: pageSize
      }
    });
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