#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  McpError,
  ErrorCode,
  CallToolRequest,
  CallToolResult
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import dotenv from "dotenv";
import { exec } from 'child_process';
import { promisify } from 'util';

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

interface ArtworkSearchResult {
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

interface SearchArtworkArguments {
  query: string;
  pageSize?: number;
}

function isSearchArtworkArguments(args: unknown): args is SearchArtworkArguments {
  if (!args || typeof args !== 'object') return false;
  const { query } = args as any;
  return typeof query === 'string';
}

interface ArtworkDetails {
  artObject: {
    id: string;
    objectNumber: string;
    title: string;
    // Add other relevant fields based on the API response
  };
}

interface ImageTiles {
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

interface UserSet {
  id: string;
  name: string;
  description: string | null;
  count: number;
  // Add other relevant fields
}

interface UserSetDetails extends UserSet {
  setItems: Array<{
    id: string;
    objectNumber: string;
    // Add other relevant fields
  }>;
}

interface OpenImageArguments {
  imageUrl: string;
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
        tools: {}
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