import { RijksmuseumApiClient } from "../api/RijksmuseumApiClient.js";
import { ErrorHandler } from "../error/ErrorHandler.js";

export class ResourceHandler {
  constructor(private apiClient: RijksmuseumApiClient) {}

  async listResources() {
    return {
      resources: [{
        uri: "art://collection/popular",
        name: "Popular Artworks",
        mimeType: "application/json",
        description: "Most viewed artworks in the collection"
      }]
    };
  }

  async readResource(uri: string) {
    try {
      switch (uri) {
        case "art://collection/popular":
          const popularArtworks = await this.apiClient.searchArtworks("", 10);
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify(popularArtworks, null, 2)
            }]
          };

        default:
          throw new Error(`Resource not found: ${uri}`);
      }
    } catch (error) {
      ErrorHandler.handleError(error);
    }
  }
} 