#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  McpError,
  ErrorCode,
  CallToolRequest,
  CallToolResult,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import dotenv from "dotenv";
import { exec } from 'child_process';
import { promisify } from 'util';
import { 
  TimelineArtwork, 
  ArtworkSearchResult, 
  SearchArtworkArguments, 
  ArtworkDetails,
  ImageTiles,
  UserSet,
  UserSetDetails,
  OpenImageArguments,
  Prompt
} from './types.js';

// Load environment variables
dotenv.config();

const API_KEY = process.env.RIJKSMUSEUM_API_KEY;
if (!API_KEY) {
  throw new Error("RIJKSMUSEUM_API_KEY environment variable is required");
}

// API configuration
const API_CONFIG = {
  BASE_URL: 'https://www.rijksmuseum.nl/api/en',
  ENDPOINTS: {
    COLLECTION: 'collection'
  }
};

function isSearchArtworkArguments(args: unknown): args is SearchArtworkArguments {
  if (!args || typeof args !== 'object') return false;
  const { query } = args as any;
  return typeof query === 'string';
}

function isOpenImageArguments(args: unknown): args is OpenImageArguments {
  if (!args || typeof args !== 'object') return false;
  const { imageUrl } = args as any;
  return typeof imageUrl === 'string' && imageUrl.startsWith('http');
}

class RijksmuseumServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server({
      name: "rijksmuseum-server",
      version: "0.1.0"
    }, {
      capabilities: {
        tools: {},
        resources: {
          list: true,
          read: true,
          subscribe: false
        },
        prompts: {
          list: true,
          get: true
        }
      }
    });

    // Configure axios with defaults
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      params: {
        key: API_KEY,
        format: 'json'
      }
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "search_artwork",
          description: "Search for artworks in the Rijksmuseum collection",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search terms to find artwork (e.g. title, artist, etc)"
              },
              pageSize: {
                type: "number",
                description: "Number of results to return (1-100)",
                minimum: 1,
                maximum: 100,
                default: 10
              }
            },
            required: ["query"]
          }
        },
        {
          name: "get_artwork_details",
          description: "Get detailed information about a specific artwork",
          inputSchema: {
            type: "object",
            properties: {
              objectNumber: {
                type: "string",
                description: "The identifier of the artwork (e.g. SK-C-5 for The Night Watch)"
              }
            },
            required: ["objectNumber"]
          }
        },
        {
          name: "get_artwork_image",
          description: "Get image tiles information for an artwork",
          inputSchema: {
            type: "object",
            properties: {
              objectNumber: {
                type: "string",
                description: "The identifier of the artwork"
              }
            },
            required: ["objectNumber"]
          }
        },
        {
          name: "get_user_sets",
          description: "Get collections created by Rijksstudio users",
          inputSchema: {
            type: "object",
            properties: {
              page: {
                type: "number",
                description: "Page number to fetch (0-based)",
                minimum: 0,
                default: 0
              },
              pageSize: {
                type: "number",
                description: "Number of results per page (1-100)",
                minimum: 1,
                maximum: 100,
                default: 10
              }
            }
          }
        },
        {
          name: "get_user_set_details",
          description: "Get details about a specific user collection",
          inputSchema: {
            type: "object",
            properties: {
              setId: {
                type: "string",
                description: "The ID of the user set to fetch"
              }
            },
            required: ["setId"]
          }
        },
        {
          name: "open_image_in_browser",
          description: "Open an artwork image URL in your default browser",
          inputSchema: {
            type: "object",
            properties: {
              imageUrl: {
                type: "string",
                description: "The URL of the image to open"
              }
            },
            required: ["imageUrl"]
          }
        },
        {
          name: "search_artwork",
          description: "Search the Rijksmuseum collection",
          inputSchema: {
            type: "object",
            properties: {
              query: { 
                type: "string",
                description: "Search terms (optional)"
              },
              artist: {
                type: "string",
                description: "Filter by artist name (optional)"
              },
              century: {
                type: "number",
                description: "Filter by century, e.g. 17 for 17th century (optional)"
              },
              color: {
                type: "string",
                description: "Filter by dominant color hex code (optional)"
              }
            }
          }
        },
        {
          name: "analyze_colors",
          description: "Analyze the color palette of an artwork",
          inputSchema: {
            type: "object", 
            properties: {
              artworkId: {
                type: "string",
                description: "The ID of the artwork to analyze"
              }
            },
            required: ["artworkId"]
          }
        },
        {
          name: "get_artist_timeline",
          description: "Get a chronological timeline of an artist's works",
          inputSchema: {
            type: "object",
            properties: {
              artist: {
                type: "string",
                description: "Name of the artist"
              },
              maxWorks: {
                type: "number",
                description: "Maximum number of works to include",
                minimum: 1,
                maximum: 50,
                default: 10
              }
            },
            required: ["artist"]
          }
        }
      ]
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      if (!request.params.arguments) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Arguments are required"
        );
      }

      try {
        switch (request.params.name) {
          case "search_artwork":
            if (!isSearchArtworkArguments(request.params.arguments)) {
              throw new McpError(
                ErrorCode.InvalidRequest,
                "Invalid arguments: query is required and must be a string"
              );
            }

            const { query, pageSize: searchPageSize = 10 } = request.params.arguments;

            const response = await this.axiosInstance.get(API_CONFIG.ENDPOINTS.COLLECTION, {
              params: {
                q: query,
                ps: searchPageSize
              }
            });

            const artworks = response.data.artObjects.map((artwork: ArtworkSearchResult) => ({
              id: artwork.id,
              objectNumber: artwork.objectNumber,
              title: artwork.title,
              artist: artwork.principalOrFirstMaker,
              description: artwork.longTitle,
              details: {
                dimensions: artwork.subTitle,
                maker: artwork.scLabelLine,
                location: artwork.location
              },
              image: artwork.webImage ? {
                url: artwork.webImage.url,
                width: artwork.webImage.width,
                height: artwork.webImage.height
              } : null
            }));

            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  count: artworks.length,
                  artworks: artworks
                }, null, 2)
              }]
            };

          case "get_artwork_details":
            const { objectNumber } = request.params.arguments as { objectNumber: string };
            const detailsResponse = await this.axiosInstance.get(`collection/${objectNumber}`);
            return {
              content: [{
                type: "text",
                text: JSON.stringify(detailsResponse.data, null, 2)
              }]
            };

          case "get_artwork_image":
            const { objectNumber: artworkNumber } = request.params.arguments as { objectNumber: string };
            const imageResponse = await this.axiosInstance.get(`collection/${artworkNumber}/tiles`);
            return {
              content: [{
                type: "text",
                text: JSON.stringify(imageResponse.data, null, 2)
              }]
            };

          case "get_user_sets":
            const { 
              page: userSetsPage = 0, 
              pageSize: userSetsPageSize = 10 
            } = request.params.arguments as { page?: number, pageSize?: number };
            
            const setsResponse = await this.axiosInstance.get('usersets', {
              params: { 
                page: userSetsPage, 
                pageSize: userSetsPageSize 
              }
            });
            return {
              content: [{
                type: "text",
                text: JSON.stringify(setsResponse.data, null, 2)
              }]
            };

          case "get_user_set_details":
            const { setId } = request.params.arguments as { setId: string };
            const setResponse = await this.axiosInstance.get(`usersets/${setId}`);
            return {
              content: [{
                type: "text",
                text: JSON.stringify(setResponse.data, null, 2)
              }]
            };

          case "open_image_in_browser":
            if (!isOpenImageArguments(request.params.arguments)) {
              throw new McpError(
                ErrorCode.InvalidRequest,
                "Invalid arguments: imageUrl is required and must be a valid URL string"
              );
            }

            try {
              await this.openInBrowser(request.params.arguments.imageUrl);
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

          case "get_artist_timeline":
            const { artist, maxWorks = 10 } = request.params.arguments as { artist: string; maxWorks?: number };
            
            const timelineResponse = await this.axiosInstance.get(API_CONFIG.ENDPOINTS.COLLECTION, {
              params: {
                involvedMaker: artist,
                ps: maxWorks,
                s: "chronologic",
                imgonly: true
              }
            });

            const timelineArtworks: TimelineArtwork[] = timelineResponse.data.artObjects.map((artwork: ArtworkSearchResult) => ({
              year: artwork.longTitle.match(/\d{4}/)?.[0] || "Unknown",
              title: artwork.title,
              objectNumber: artwork.objectNumber,
              description: artwork.longTitle,
              image: artwork.webImage ? artwork.webImage.url : null
            }));

            // Sort by year
            timelineArtworks.sort((a: TimelineArtwork, b: TimelineArtwork) => {
              if (a.year === "Unknown") return 1;
              if (b.year === "Unknown") return -1;
              return parseInt(a.year) - parseInt(b.year);
            });

            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  artist,
                  works: timelineArtworks
                }, null, 2)
              }]
            };

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [{
              type: "text",
              text: `Rijksmuseum API error: ${error.response?.data?.message || error.message}`
            }],
            isError: true
          };
        }
        throw error;
      }
    });

    // 2. Color Analysis Resource
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [{
        uri: "art://collection/popular",
        name: "Popular Artworks",
        mimeType: "application/json",
        description: "Most viewed artworks in the collection"
    }]
    }));

    // Add read resource handler
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      try {
        switch (request.params.uri) {
          case "art://collection/popular":
            const popularResponse = await this.axiosInstance.get(API_CONFIG.ENDPOINTS.COLLECTION, {
              params: {
                ps: 10,
                s: "relevance"
              }
            });
            return {
              contents: [{
                uri: request.params.uri,
                mimeType: "application/json",
                text: JSON.stringify(popularResponse.data, null, 2)
              }]
            };

          default:
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Resource not found: ${request.params.uri}`
            );
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `Rijksmuseum API error: ${error.response?.data?.message || error.message}`
          );
        }
        throw error;
      }
    });

    // 3. Add a prompt template for art analysis
    interface Prompt {
      name: string;
      description: string;
      arguments: Array<{
        name: string;
        description: string;
        required: boolean;
      }>;
    }

    const PROMPTS: Record<string, Prompt> = {
      "analyze-artwork": {
        name: "analyze-artwork",
        description: "Analyze an artwork's composition, style, and historical context",
        arguments: [{
          name: "artworkId",
          description: "ID of the artwork to analyze",
          required: true
        }]
      },
      "generate-artist-timeline": {
        name: "generate-artist-timeline",
        description: "Generate a chronological timeline of an artist's most notable works",
        arguments: [{
          name: "artist",
          description: "Name of the artist",
          required: true
        }, {
          name: "maxWorks",
          description: "Maximum number of works to include (default: 10)",
          required: false
        }]
      }
    };

    // Add prompt handlers
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: Object.values(PROMPTS)
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const prompt = PROMPTS[request.params.name];
      if (!prompt) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Prompt not found: ${request.params.name}`
        );
      }

      if (request.params.name === "generate-artist-timeline") {
        const { artist, maxWorks } = request.params.arguments || {};
        if (!artist) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            "Artist name is required"
          );
        }

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Create a visual timeline artifact showing the chronological progression of ${artist}'s most notable works${maxWorks ? ` (limited to ${maxWorks} works)` : ''}.

For each work, include:
- Year of creation
- Title of the work
- A brief description
- The artist's age at the time of creation

Format the timeline as a visually appealing chronological progression, with clear spacing between different time periods. Use markdown formatting to enhance readability.

The data for this timeline will be provided by the get_artist_timeline tool. Please call this tool with the artist name "${artist}"${maxWorks ? ` and maxWorks=${maxWorks}` : ''} to get the artwork data, then create a beautiful visualization of the timeline.`
              }
            }
          ]
        };
      }

      // Handle other prompts...
      if (request.params.name === "analyze-artwork") {
        const { artworkId } = request.params.arguments || {};
        if (!artworkId) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            "Artwork ID is required"
          );
        }

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Analyze the composition, style, and historical context of artwork ${artworkId} and provide a detailed analysis of the artwork's meaning and significance in the context of the artist's oeuvre and the broader art world, then create a beautiful artifact that captures the essence of the artwork and its context.`
              }
            }
          ]
        };
      }

      throw new McpError(
        ErrorCode.InvalidRequest,
        `Prompt implementation not found: ${request.params.name}`
      );
    });
  }

  private async openInBrowser(url: string): Promise<void> {
    const execAsync = promisify(exec);
    const cmd = process.platform === 'win32' ? 'start' :
                process.platform === 'darwin' ? 'open' :
                'xdg-open';
    
    await execAsync(`${cmd} "${url}"`);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    
    await this.server.connect(transport);
    console.error("Rijksmuseum MCP server running on stdio");
  }
}

// Start the server
const server = new RijksmuseumServer();
server.run().catch(console.error); 