import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { RijksmuseumApiClient } from "../api/RijksmuseumApiClient.js";
import { ErrorHandler } from "../error/ErrorHandler.js";
import { isSearchArtworkArguments, isOpenImageArguments, isGetUserSetDetailsArguments } from "../utils/typeGuards.js";
import { SystemIntegration } from "../utils/SystemIntegration.js";
import { GetUserSetsArguments, GetUserSetDetailsArguments } from "../types.js";

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

    const artworks = await this.apiClient.searchArtworks(request.params.arguments);

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
    const { objectNumber, culture = 'en' } = request.params.arguments as { objectNumber: string; culture?: 'nl' | 'en' };
    ErrorHandler.validateRequiredParam(objectNumber, 'objectNumber');

    const details = await this.apiClient.getArtworkDetails(objectNumber, culture);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(details, null, 2)
      }]
    };
  }

  private async handleGetArtworkImage(request: CallToolRequest) {
    const { objectNumber, culture = 'en' } = request.params.arguments as { objectNumber: string; culture?: 'nl' | 'en' };
    ErrorHandler.validateRequiredParam(objectNumber, 'objectNumber');

    const imageData = await this.apiClient.getArtworkImageTiles(objectNumber, culture);

    // Format the response to be more readable and include summary information
    const summary = {
      totalLevels: imageData.levels.length,
      zoomLevels: imageData.levels.map(level => ({
        name: level.name,
        resolution: `${level.width}x${level.height}`,
        tilesCount: level.tiles.length
      })),
      details: imageData
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(summary, null, 2)
      }]
    };
  }

  private async handleGetUserSets(request: CallToolRequest) {
    const { page = 0, pageSize = 10, culture = 'en' } = request.params.arguments as GetUserSetsArguments;
    const userSetsResponse = await this.apiClient.getUserSets({ page, pageSize, culture });

    // Format the response to be more readable
    const summary = {
      totalSets: userSetsResponse.count,
      currentPage: page,
      pageSize: pageSize,
      fetchedSets: userSetsResponse.userSets.length,
      queryTimeMs: userSetsResponse.elapsedMilliseconds,
      sets: userSetsResponse.userSets.map(set => ({
        id: set.id,
        name: set.name,
        description: set.description,
        itemCount: set.count,
        creator: set.user.name,
        createdOn: set.createdOn,
        updatedOn: set.updatedOn,
        links: set.links
      }))
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(summary, null, 2)
      }]
    };
  }

  private async handleGetUserSetDetails(request: CallToolRequest) {
    if (!isGetUserSetDetailsArguments(request.params.arguments)) {
      throw new Error("Invalid arguments for get_user_set_details");
    }

    const { setId, culture = 'en', page = 0, pageSize = 25 } = request.params.arguments;
    ErrorHandler.validateRequiredParam(setId, 'setId');

    const setDetails = await this.apiClient.getUserSetDetails({ setId, culture, page, pageSize });

    // Format the response to be more readable
    const summary = {
      setInfo: {
        id: setDetails.userSet.id,
        name: setDetails.userSet.name,
        description: setDetails.userSet.description,
        type: setDetails.userSet.type,
        totalItems: setDetails.userSet.count,
        creator: setDetails.userSet.user.name,
        createdOn: setDetails.userSet.createdOn,
        updatedOn: setDetails.userSet.updatedOn
      },
      items: setDetails.userSet.setItems.map(item => ({
        objectNumber: item.objectNumber,
        links: item.links,
        imageInfo: item.image ? {
          dimensions: `${item.image.width}x${item.image.height}`,
          url: item.image.cdnUrl
        } : null
      })),
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        fetchedItems: setDetails.userSet.setItems.length
      },
      queryTimeMs: setDetails.elapsedMilliseconds
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(summary, null, 2)
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