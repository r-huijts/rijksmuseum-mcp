#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { Config } from "./config/Config.js";
import { RijksmuseumApiClient } from "./api/RijksmuseumApiClient.js";
import { ToolHandler } from "./handlers/ToolHandler.js";
import { ResourceHandler } from "./handlers/ResourceHandler.js";
import { PromptHandler } from "./handlers/PromptHandler.js";
import { ErrorHandler } from "./error/ErrorHandler.js";

class RijksmuseumServer {
  private server: Server;
  private apiClient: RijksmuseumApiClient;
  private toolHandler: ToolHandler;
  private resourceHandler: ResourceHandler;
  private promptHandler: PromptHandler;

  constructor() {
    // Initialize API client with config
    const config = Config.getInstance();
    this.apiClient = new RijksmuseumApiClient(config.getApiKey());

    // Initialize handlers
    this.toolHandler = new ToolHandler(this.apiClient);
    this.resourceHandler = new ResourceHandler(this.apiClient);
    this.promptHandler = new PromptHandler();

    // Initialize server
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
          description: "Search and filter artworks in the Rijksmuseum collection. This tool provides extensive filtering options including artist name, type of artwork, materials, techniques, time periods, colors, and more. Results can be sorted in various ways and are paginated.",
          inputSchema: {
            type: "object",
            properties: {
              q: {
                type: "string",
                description: "General search query that will match against artwork titles, descriptions, materials, techniques, etc. Use this for broad searches like 'sunflowers', 'portrait', 'landscape', etc."
              },
              involvedMaker: {
                type: "string",
                description: "Search for artworks by a specific artist. Must be case-sensitive and exact, e.g., 'Rembrandt van Rijn', 'Vincent van Gogh'. Use + for spaces in names."
              },
              type: {
                type: "string",
                description: "Filter by the type of artwork. Common values include 'painting', 'print', 'drawing', 'sculpture', 'photograph', 'furniture'. Use singular form."
              },
              material: {
                type: "string",
                description: "Filter by the material used in the artwork. Examples: 'canvas', 'paper', 'wood', 'oil paint', 'marble'. Matches exact material names from the museum's classification."
              },
              technique: {
                type: "string",
                description: "Filter by the technique used to create the artwork. Examples: 'oil painting', 'etching', 'watercolor', 'photography'. Matches specific techniques from the museum's classification."
              },
              century: {
                type: "integer",
                description: "Filter artworks by the century they were created in. Use negative numbers for BCE, positive for CE. Range from -1 (100-1 BCE) to 21 (2000-2099 CE). Example: 17 for 17th century (1600-1699).",
                minimum: -1,
                maximum: 21
              },
              color: {
                type: "string",
                description: "Filter artworks by predominant color. Use hexadecimal color codes without the # symbol. Examples: 'FF0000' for red, '00FF00' for green, '0000FF' for blue. The API will match artworks containing this color."
              },
              imgonly: {
                type: "boolean",
                description: "When true, only returns artworks that have associated images. Set to true if you need to show or analyze the visual aspects of artworks.",
                default: false
              },
              toppieces: {
                type: "boolean",
                description: "When true, only returns artworks designated as masterpieces by the Rijksmuseum. These are the most significant and famous works in the collection.",
                default: false
              },
              sortBy: {
                type: "string",
                enum: ["relevance", "objecttype", "chronologic", "achronologic", "artist", "artistdesc"],
                description: "Determines the order of results. Options: 'relevance' (best matches first), 'objecttype' (grouped by type), 'chronologic' (oldest to newest), 'achronologic' (newest to oldest), 'artist' (artist name A-Z), 'artistdesc' (artist name Z-A).",
                default: "relevance"
              },
              p: {
                type: "integer",
                description: "Page number for paginated results, starting at 0. Use in combination with 'ps' to navigate through large result sets. Note: p * ps cannot exceed 10,000.",
                minimum: 0,
                default: 0
              },
              ps: {
                type: "integer",
                description: "Number of artworks to return per page. Higher values return more results but take longer to process. Maximum of 100 items per page.",
                minimum: 1,
                maximum: 100,
                default: 10
              },
              culture: {
                type: "string",
                enum: ["nl", "en"],
                description: "Language for the search and returned data. Use 'en' for English or 'nl' for Dutch (Nederlands). Affects artwork titles, descriptions, and other text fields.",
                default: "en"
              }
            }
          }
        },
        {
          name: "get_artwork_details",
          description: "Retrieve comprehensive details about a specific artwork using its unique identifier. Returns detailed information including title, artist, creation date, physical properties, historical context, acquisition details, and more. Essential for in-depth analysis of a single artwork.",
          inputSchema: {
            type: "object",
            properties: {
              objectNumber: {
                type: "string",
                description: "The unique identifier of the artwork in the Rijksmuseum collection. Format is typically a combination of letters and numbers, e.g., 'SK-C-5' for The Night Watch, 'SK-A-3262' for Van Gogh's Self Portrait. This ID can be obtained from search results."
              }
            },
            required: ["objectNumber"]
          }
        },
        {
          name: "get_artwork_image",
          description: "Retrieve detailed image tile information for high-resolution viewing of an artwork. This tool provides data for implementing deep zoom functionality, allowing detailed examination of the artwork at various zoom levels. Useful for studying fine details, brushwork, or conservation details.",
          inputSchema: {
            type: "object",
            properties: {
              objectNumber: {
                type: "string",
                description: "The unique identifier of the artwork in the Rijksmuseum collection. Same format as used in get_artwork_details. The artwork must have an associated image for this to work."
              }
            },
            required: ["objectNumber"]
          }
        },
        {
          name: "get_user_sets",
          description: "Retrieve collections created by Rijksstudio users. These are curated sets of artworks that users have grouped together, often around themes, artists, or periods. Useful for discovering thematically related artworks or user-curated exhibitions.",
          inputSchema: {
            type: "object",
            properties: {
              page: {
                type: "number",
                description: "Page number for paginated results, starting at 0. Use with pageSize to navigate through large sets of user collections.",
                minimum: 0,
                default: 0
              },
              pageSize: {
                type: "number",
                description: "Number of user collections to return per page. Adjust based on how many collections you want to analyze at once.",
                minimum: 1,
                maximum: 100,
                default: 10
              }
            }
          }
        },
        {
          name: "get_user_set_details",
          description: "Get detailed information about a specific user-created collection, including all artworks in the set. Useful for analyzing thematic groupings, studying curatorial choices, or exploring relationships between artworks.",
          inputSchema: {
            type: "object",
            properties: {
              setId: {
                type: "string",
                description: "The unique identifier of the user collection to fetch. This ID can be obtained from the get_user_sets results. Each set represents a curated group of artworks."
              }
            },
            required: ["setId"]
          }
        },
        {
          name: "open_image_in_browser",
          description: "Open a high-resolution image of an artwork in the default web browser for viewing. This tool is useful when you want to examine an artwork visually or show it to the user. Works with any valid Rijksmuseum image URL.",
          inputSchema: {
            type: "object",
            properties: {
              imageUrl: {
                type: "string",
                description: "The full URL of the artwork image to open. Must be a valid HTTP/HTTPS URL from the Rijksmuseum's servers. These URLs can be obtained from artwork search results or details."
              }
            },
            required: ["imageUrl"]
          }
        },
        {
          name: "get_artist_timeline",
          description: "Generate a chronological timeline of an artist's works in the Rijksmuseum collection. This tool is perfect for studying an artist's development, analyzing their artistic periods, or understanding their contribution to art history over time.",
          inputSchema: {
            type: "object",
            properties: {
              artist: {
                type: "string",
                description: "The name of the artist to create a timeline for. Must match the museum's naming convention (e.g., 'Rembrandt van Rijn', 'Vincent van Gogh'). Case sensitive and exact match required."
              },
              maxWorks: {
                type: "number",
                description: "Maximum number of works to include in the timeline. Works are selected based on significance and quality of available images. Higher numbers give a more complete picture but may include less significant works.",
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
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await this.toolHandler.handleToolRequest(request);
    });

    // Handle resource requests
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return await this.resourceHandler.listResources();
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return await this.resourceHandler.readResource(request.params.uri);
    });

    // Handle prompt requests
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return this.promptHandler.listPrompts();
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      return this.promptHandler.getPrompt(request.params.name, request.params.arguments || {});
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
server.run().catch((error) => {
  ErrorHandler.handleError(error);
}); 