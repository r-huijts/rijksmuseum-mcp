import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Prompt } from "../types.js";

export class PromptHandler {
  private readonly PROMPTS: Record<string, Prompt> = {
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

  listPrompts() {
    return {
      prompts: Object.values(this.PROMPTS)
    };
  }

  getPrompt(name: string, arguments_: Record<string, unknown>) {
    const prompt = this.PROMPTS[name];
    if (!prompt) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Prompt not found: ${name}`
      );
    }

    if (name === "generate-artist-timeline") {
      const { artist, maxWorks } = arguments_ || {};
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

    if (name === "analyze-artwork") {
      const { artworkId } = arguments_ || {};
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
      `Prompt implementation not found: ${name}`
    );
  }
} 