import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  ArtworkSearchResult, 
  ArtworkDetails, 
  ImageTiles, 
  UserSet, 
  TimelineArtwork,
  SearchArtworkArguments,
  GetUserSetsArguments,
  UserSetsResponse,
  GetUserSetDetailsArguments,
  UserSetDetails
} from '../types.js';

export class RijksmuseumApiClient {
  private axiosInstance: AxiosInstance;
  private readonly BASE_URL = 'https://www.rijksmuseum.nl/api';
  private readonly ENDPOINTS = {
    COLLECTION: 'collection'
  };

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required for Rijksmuseum API');
    }

    this.axiosInstance = axios.create({
      baseURL: this.BASE_URL,
      params: {
        key: apiKey,
        format: 'json'
      }
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          throw new Error(`Rijksmuseum API error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error('No response received from Rijksmuseum API');
        } else {
          // Something happened in setting up the request that triggered an Error
          throw new Error(`Error making request to Rijksmuseum API: ${error.message}`);
        }
      }
    );
  }

  async searchArtworks(params: SearchArtworkArguments): Promise<ArtworkSearchResult[]> {
    try {
      // Validate page and pageSize constraints
      const p = params.p ?? 0;
      const ps = params.ps ?? 10;
      
      if (p * ps > 10000) {
        throw new Error('Page * pageSize cannot exceed 10,000');
      }

      // Build API parameters
      const apiParams: Record<string, any> = {
        p,
        ps
      };

      // Add optional parameters if they exist
      if (params.q) apiParams.q = params.q;
      if (params.involvedMaker) apiParams.involvedMaker = encodeURIComponent(params.involvedMaker);
      if (params.type) apiParams.type = encodeURIComponent(params.type);
      if (params.material) apiParams.material = encodeURIComponent(params.material);
      if (params.technique) apiParams.technique = encodeURIComponent(params.technique);
      if (params.century) apiParams['f.dating.period'] = params.century;
      if (params.color) apiParams['f.normalized32Colors.hex'] = params.color.replace('#', '');
      if (params.imgonly !== undefined) apiParams.imgonly = params.imgonly;
      if (params.toppieces !== undefined) apiParams.toppieces = params.toppieces;
      if (params.sortBy) apiParams.s = params.sortBy;

      const culture = params.culture ?? 'en';
      const response = await this.axiosInstance.get(`${culture}/${this.ENDPOINTS.COLLECTION}`, {
        params: apiParams
      });

      if (!response.data.artObjects) {
        throw new Error('Invalid response from Rijksmuseum API: missing artObjects');
      }

      return response.data.artObjects;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while searching artworks');
    }
  }

  async getArtworkDetails(objectNumber: string, culture: 'nl' | 'en' = 'en'): Promise<ArtworkDetails> {
    try {
      if (!objectNumber) {
        throw new Error('Object number is required');
      }

      // Ensure object number is properly encoded
      const encodedObjectNumber = encodeURIComponent(objectNumber);
      const response = await this.axiosInstance.get(`${culture}/${this.ENDPOINTS.COLLECTION}/${encodedObjectNumber}`);

      if (!response.data.artObject) {
        throw new Error('Invalid response from Rijksmuseum API: missing artObject');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching artwork details');
    }
  }

  async getArtworkImageTiles(objectNumber: string, culture: 'nl' | 'en' = 'en'): Promise<ImageTiles> {
    try {
      if (!objectNumber) {
        throw new Error('Object number is required');
      }

      const encodedObjectNumber = encodeURIComponent(objectNumber);
      const response = await this.axiosInstance.get(`${culture}/${this.ENDPOINTS.COLLECTION}/${encodedObjectNumber}/tiles`);

      if (!response.data.levels || !Array.isArray(response.data.levels)) {
        throw new Error('Invalid response from Rijksmuseum API: missing or invalid image tiles data');
      }

      // Validate the structure of each level
      response.data.levels.forEach((level: any, index: number) => {
        if (!level.name || typeof level.width !== 'number' || typeof level.height !== 'number' || !Array.isArray(level.tiles)) {
          throw new Error(`Invalid level data at index ${index}`);
        }
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching artwork image tiles');
    }
  }

  async getUserSets({ page = 0, pageSize = 10, culture = 'en' }: GetUserSetsArguments = {}): Promise<UserSetsResponse> {
    try {
      // Validate pagination constraints
      if (page * pageSize > 10000) {
        throw new Error('Page * pageSize cannot exceed 10,000');
      }

      if (pageSize < 1 || pageSize > 100) {
        throw new Error('Page size must be between 1 and 100');
      }

      const response = await this.axiosInstance.get(`${culture}/usersets`, {
        params: { 
          page,
          pageSize
        }
      });

      if (!response.data.userSets || !Array.isArray(response.data.userSets)) {
        throw new Error('Invalid response from Rijksmuseum API: missing or invalid userSets data');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching user sets');
    }
  }

  async getUserSetDetails({ setId, culture = 'en', page = 0, pageSize = 25 }: GetUserSetDetailsArguments): Promise<UserSetDetails> {
    try {
      if (!setId) {
        throw new Error('Set ID is required');
      }

      // Validate pagination constraints
      if (page * pageSize > 10000) {
        throw new Error('Page * pageSize cannot exceed 10,000');
      }

      if (pageSize < 1 || pageSize > 100) {
        throw new Error('Page size must be between 1 and 100');
      }

      const encodedSetId = encodeURIComponent(setId);
      const response = await this.axiosInstance.get(`${culture}/usersets/${encodedSetId}`, {
        params: {
          page,
          pageSize
        }
      });

      if (!response.data.userSet) {
        throw new Error('Invalid response from Rijksmuseum API: missing user set data');
      }

      // Validate the structure of setItems if they exist
      if (response.data.userSet.setItems && !Array.isArray(response.data.userSet.setItems)) {
        throw new Error('Invalid response from Rijksmuseum API: invalid setItems format');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching user set details');
    }
  }

  async getArtistTimeline(artist: string, maxWorks: number = 10): Promise<TimelineArtwork[]> {
    try {
      if (!artist) {
        throw new Error('Artist name is required');
      }

      const response = await this.axiosInstance.get(`${this.ENDPOINTS.COLLECTION}`, {
        params: {
          involvedMaker: encodeURIComponent(artist),
          ps: maxWorks,
          s: 'chronologic',
          imgonly: true
        }
      });

      if (!response.data.artObjects) {
        throw new Error('Invalid response from Rijksmuseum API: missing artObjects');
      }

      return response.data.artObjects.map((artwork: ArtworkSearchResult) => ({
        year: artwork.longTitle.match(/\d{4}/)?.[0] || "Unknown",
        title: artwork.title,
        objectNumber: artwork.objectNumber,
        description: artwork.longTitle,
        image: artwork.webImage ? artwork.webImage.url : null
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching artist timeline');
    }
  }
} 