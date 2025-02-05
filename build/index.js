#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Config } from "./config/Config.js";
import { RijksmuseumApiClient } from "./api/RijksmuseumApiClient.js";
import { ToolHandler } from "./handlers/ToolHandler.js";
import { ResourceHandler } from "./handlers/ResourceHandler.js";
import { PromptHandler } from "./handlers/PromptHandler.js";
import { ErrorHandler } from "./error/ErrorHandler.js";
class RijksmuseumServer {
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
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error("[MCP Error]", error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupHandlers() {
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
    async run() {
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
