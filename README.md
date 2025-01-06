![rijksmuseum logo](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Logo_Rijksmuseum.svg/799px-Logo_Rijksmuseum.svg.png)

# Rijksmuseum Amsterdam MCP Server

This project implements a Model Context Protocol (MCP) server that interfaces with the Rijksmuseum API. It allows you to search for artworks, retrieve detailed information about specific artworks, access image tiles for artworks, and explore user-created collections from Amsterdam's famous Rijksmuseum.

<a href="https://glama.ai/mcp/servers/4rmiexp64y"><img width="380" height="200" src="https://glama.ai/mcp/servers/4rmiexp64y/badge" alt="Rijksmuseum Server MCP server" /></a>

## Features

- **Search Artworks**: Find artworks in the Rijksmuseum collection using search terms
- **Artwork Details**: Retrieve detailed information about a specific artwork
- **Artwork Images**: Access image tiles for high-resolution views of artworks
- **User Collections**: Explore collections created by users in Rijksstudio
- **User Collection Details**: Get detailed information about a specific user collection
- **Open Images in Browser**: Directly open artwork images in your system's default web browser
- **Artist Timelines**: Create chronological timelines of an artist's works

## Prerequisites

- Node.js v18 or higher
- An API key from the Rijksmuseum (get one by registering at [https://www.rijksmuseum.nl/en/research/conduct-research/data](https://www.rijksmuseum.nl/en/research/conduct-research/data))

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables
Create a `.env` file in the root directory with your Rijksmuseum API key:
```
RIJKSMUSEUM_API_KEY=your-api-key-here
```

### Claude Desktop Integration

To use this server with Claude Desktop:

1. Locate your Claude Desktop configuration file:
   - **MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%AppData%\Claude\claude_desktop_config.json`

2. Add the server configuration:
   ```json
   {
     "mcpServers": {
       "rijksmuseum": {
         "command": "node",
         "args": ["/absolute/path/to/build/index.js"],
         "env": {
           "RIJKSMUSEUM_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

   Replace `/absolute/path/to/build/index.js` with the absolute path to the built JavaScript file in your project's `build` directory.

3. Restart Claude Desktop for the changes to take effect.

## Available Tools

The server provides several tools that can be accessed through MCP clients:

### search_artwork
Search for artworks using a query string.
```
Input: Query string (e.g., "Rembrandt", "flowers", "night")
Output: List of matching artworks with basic details
```

### get_artwork_details
Retrieve detailed information about an artwork using its object number.
```
Input: Object number (e.g., "SK-C-5" for The Night Watch)
Output: Comprehensive artwork details including title, artist, date, materials, etc.
```

### get_artwork_image
Get image tiles for an artwork using its object number.
```
Input: Object number
Output: Available image tiles and resolutions
```

### get_user_sets
List user-created collections.
```
Input: None
Output: List of recent user collections
```

### get_user_set_details
Retrieve details about a specific user collection.
```
Input: Collection ID
Output: Collection details and contained artworks
```

### open_image_in_browser
Open an artwork's image URL directly in your default web browser.
```
Input: Image URL
Output: Success/failure status
```

### get_artist_timeline
Create a chronological timeline of an artist's works.
```
Input: 
  - artist: Name of the artist
  - maxWorks: Maximum number of works to include (default: 10, max: 50)
Output: Chronologically ordered list of the artist's works
```

## Available Prompts

The server provides prompt templates for common tasks:

### analyze-artwork
Generate a detailed analysis of an artwork's composition, style, and historical context.
```
Input: 
  - artworkId: ID of the artwork to analyze
Output: Comprehensive analysis of the artwork
```

### generate-artist-timeline
Create a visual timeline showing the chronological progression of an artist's works.
```
Input:
  - artist: Name of the artist
  - maxWorks: Maximum number of works to include (optional)
Output: Visual timeline with artwork details and chronological progression
```

## Available Resources

The server provides access to curated collections:

### art://collection/popular
Access the most viewed artworks in the collection.
```
Type: application/json
Description: Popular artworks from the Rijksmuseum collection
```

## Example Queries for Claude

Here are some natural language queries you can use with Claude to interact with the tools:

### Searching and Exploring
```
"Show me paintings by Rembrandt"
"Find artworks featuring flowers"
"What artworks in the collection include cats?"
```

### Detailed Information
```
"Tell me more about The Night Watch"
"What are the details of Vermeer's The Milkmaid?"
"Get information about SK-C-5"
```

### Images and Visualization
```
"Open The Night Watch in my browser"
"Show me a high-resolution version of this painting"
"Can I see this artwork in more detail?"
```

### Artist Timelines and Analysis
```
"Create a timeline of Rembrandt's works"
"Analyze the composition of The Night Watch"
"Show me the progression of Vermeer's paintings"
```

### Combined Queries
```
"Find paintings of flowers and open the first one in my browser"
"Search for Vermeer's works and tell me about The Milkmaid"
"Create a timeline of Rembrandt's works and analyze his self-portraits"
```

## Error Handling

The server implements standard MCP error handling:

- Invalid requests return appropriate error codes and messages
- API errors are properly formatted and passed through to the client
- Network issues are handled gracefully with informative error messages

## Development

### Building from Source

1. Make changes to the source code in the `src` directory
2. Build the project:
   ```bash
   npm run build
   ```
3. The built files will be in the `build` directory

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the tests
5. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.