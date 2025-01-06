import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { RijksmuseumApiClient } from "../api/RijksmuseumApiClient.js";
import { ErrorHandler } from "../error/ErrorHandler.js";
import { isSearchArtworkArguments, isOpenImageArguments } from "../utils/typeGuards.js";
import { SystemIntegration } from "../utils/SystemIntegration.js";

export class ToolHandler {
  constructor(private apiClient: RijksmuseumApiClient) {}

  async handleToolRequest(request: CallToolRequest) {
    try {
      switch (request.params.name) {
        case "search_artwork":
          return await this.handleSearchArtwork(request);
        case "get_artwork_details":
          return await this.handleGetArtworkDetails(request);
        case "get_artwork_image":
          return await this.handleGetArtworkImage(request);
        case "get_user_sets":
          return await this.handleGetUserSets(request);
        case "get_user_set_details":
          return await this.handleGetUserSetDetails(request);
        case "open_image_in_browser":
          return await this.handleOpenImageInBrowser(request);
        case "get_artist_timeline":
          return await this.handleGetArtistTimeline(request);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      ErrorHandler.handleError(error);
    }
  }

  private async handleSearchArtwork(request: CallToolRequest) {
    if (!isSearchArtworkArguments(request.params.arguments)) {
      throw new Error("Invalid arguments for search_artwork");
    }

    const { query, pageSize = 10 } = request.params.arguments;
    const artworks = await this.apiClient.searchArtworks(query, pageSize);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          count: artworks.length,
          artworks: artworks
        }, null, 2)
      }]
    };
  }

  private async handleGetArtworkDetails(request: CallToolRequest) {
    const { objectNumber } = request.params.arguments as { objectNumber: string };
    ErrorHandler.validateRequiredParam(objectNumber, 'objectNumber');

    const details = await this.apiClient.getArtworkDetails(objectNumber);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(details, null, 2)
      }]
    };
  }

  private async handleGetArtworkImage(request: CallToolRequest) {
    const { objectNumber } = request.params.arguments as { objectNumber: string };
    ErrorHandler.validateRequiredParam(objectNumber, 'objectNumber');

    const imageData = await this.apiClient.getArtworkImageTiles(objectNumber);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(imageData, null, 2)
      }]
    };
  }

  private async handleGetUserSets(request: CallToolRequest) {
    const { page = 0, pageSize = 10 } = request.params.arguments as { page?: number, pageSize?: number };
    const userSets = await this.apiClient.getUserSets(page, pageSize);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(userSets, null, 2)
      }]
    };
  }

  private async handleGetUserSetDetails(request: CallToolRequest) {
    const { setId } = request.params.arguments as { setId: string };
    ErrorHandler.validateRequiredParam(setId, 'setId');

    const setDetails = await this.apiClient.getUserSetDetails(setId);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(setDetails, null, 2)
      }]
    };
  }

  private async handleOpenImageInBrowser(request: CallToolRequest) {
    if (!isOpenImageArguments(request.params.arguments)) {
      throw new Error("Invalid arguments for open_image_in_browser");
    }

    try {
      await SystemIntegration.openInBrowser(request.params.arguments.imageUrl);
      return {
        content: [{
          type: "text",
          text: `Successfully opened image in browser: ${request.params.arguments.imageUrl}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Failed to open image in browser: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }

  private async handleGetArtistTimeline(request: CallToolRequest) {
    const { artist, maxWorks = 10 } = request.params.arguments as { artist: string; maxWorks?: number };
    ErrorHandler.validateRequiredParam(artist, 'artist');

    const timelineArtworks = await this.apiClient.getArtistTimeline(artist, maxWorks);
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          artist,
          works: timelineArtworks
        }, null, 2)
      }]
    };
  }
} 