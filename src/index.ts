import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  McpError,
  ErrorCode,
  CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import dotenv from "dotenv";

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
  title: string;
  principalOrFirstMaker: string;
  longTitle: string;
  webImage?: {
    url: string;
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
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
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
      }]
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      if (request.params.name !== "search_artwork") {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!isSearchArtworkArguments(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Invalid arguments: query is required and must be a string"
        );
      }

      const { query, pageSize = 10 } = request.params.arguments;

      try {
        const response = await this.axiosInstance.get(API_CONFIG.ENDPOINTS.COLLECTION, {
          params: {
            q: query,
            ps: pageSize
          }
        });

        const artworks = response.data.artObjects.map((artwork: ArtworkSearchResult) => ({
          id: artwork.id,
          title: artwork.title,
          artist: artwork.principalOrFirstMaker,
          fullTitle: artwork.longTitle,
          imageUrl: artwork.webImage?.url
        }));

        return {
          content: {
            mimeType: "application/json",
            text: JSON.stringify(artworks, null, 2)
          }
        };

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