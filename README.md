![rijksmuseum logo](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Logo_Rijksmuseum.svg/799px-Logo_Rijksmuseum.svg.png)

# Rijksmuseum MCP Server

A Model Context Protocol (MCP) server that provides access to the Rijksmuseum's collection through natural language interactions. This server enables AI models to explore, analyze, and interact with artworks and collections from the Rijksmuseum.

<a href="https://glama.ai/mcp/servers/4rmiexp64y"><img width="380" height="200" src="https://glama.ai/mcp/servers/4rmiexp64y/badge" alt="Rijksmuseum Server MCP server" /></a>

## Features

The server provides several tools for interacting with the Rijksmuseum's collection:

### 1. Search Artworks (`search_artwork`)
Search and filter artworks using various criteria including:
- Text-based search
- Artist name
- Artwork type
- Materials and techniques
- Time periods
- Colors
- And more

### 2. Artwork Details (`get_artwork_details`)
Retrieve comprehensive information about specific artworks, including:
- Basic details (title, artist, dates)
- Physical properties
- Historical context
- Visual information
- Curatorial information
- Exhibition history

### 3. High-Resolution Images (`get_artwork_image`)
Access high-resolution image data with deep zoom capabilities:
- Multiple zoom levels
- Tile-based image loading
- Full resolution support
- Position information

### 4. User Collections (`get_user_sets` & `get_user_set_details`)
Explore user-created collections:
- Browse curated sets
- View thematic groupings
- Analyze collection patterns
- Access detailed set information

### 5. Image Viewing (`open_image_in_browser`)
Open artwork images directly in your browser for detailed viewing.

### 6. Artist Timeline (`get_artist_timeline`)
Generate chronological timelines of artists' works:
- Track artistic development
- Analyze periods and styles
- Study career progression

## Example Use Cases

Here are some example queries you can ask the AI when using this server:

### Artwork Discovery
```
"Show me all paintings by Rembrandt from the 1640s"
"Find artworks that prominently feature the color blue"
"What are the most famous masterpieces in the collection?"
"Search for still life paintings from the Dutch Golden Age"
```

### Artwork Analysis
```
"Tell me everything about The Night Watch"
"What are the dimensions and materials used in Van Gogh's Self Portrait?"
"Show me high-resolution details of the brushwork in Vermeer's The Milkmaid"
"Compare the colors used in different versions of The Potato Eaters"
```

### Artist Research
```
"Create a timeline of Rembrandt's self-portraits"
"How did Van Gogh's use of color evolve throughout his career?"
"Show me all works by Frans Hals in chronological order"
"What techniques did Jan Steen use in his paintings?"
```

### Thematic Exploration
```
"Find all artworks depicting biblical scenes"
"Show me paintings of Amsterdam in the 17th century"
"What artworks feature flowers or still life arrangements?"
"Find portraits that include musical instruments"
```

### Collection Analysis
```
"Show me the most popular user-curated collections"
"Find sets that focus on landscape paintings"
"What are the recent additions to the museum's collection?"
"Show me collections featuring works from multiple artists"
```

### Visual Details
```
"Let me examine the details in the background of The Night Watch"
"Show me a close-up of the jewelry in Girl with a Pearl Earring"
"Can you display the highest resolution version of The Jewish Bride?"
"I want to study the facial expressions in The Syndics"
```

## Getting Started

You can install this server in two ways:

### 1. Using Claude Desktop with NPM Package
Update your Claude configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "rijksmuseum-server": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-rijksmuseum"
      ],
      "env": {
        "RIJKSMUSEUM_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
You can get an API key from the [Rijksmuseum API Portal](https://data.rijksmuseum.nl/docs/api/).

### 2. From Source
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Add your Rijksmuseum API key to the `.env` file:
   ```
   RIJKSMUSEUM_API_KEY=your_api_key_here
   ```
5. Then update your Claude configuration file:
   ```json
   {
     "mcpServers": {
       "rijksmuseum-server": {
         "command": "node",
         "args": [
           "/path/to/rijksmuseum-server/build/index.js"
         ],
         "env": {
           "RIJKSMUSEUM_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

Make sure to:
- Replace `/path/to/rijksmuseum-server` with the actual path to your installation
- Add your Rijksmuseum API key in the `env` section

After updating the configuration, restart Claude Desktop for the changes to take effect.

## Configuration

The server can be configured through environment variables:
- `RIJKSMUSEUM_API_KEY`: Your Rijksmuseum API key (required)
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (default: 'info')

## API Documentation

For detailed information about the Rijksmuseum API endpoints used by this server, visit:
[Rijksmuseum API Documentation](https://data.rijksmuseum.nl/object-metadata/api/)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or create issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
