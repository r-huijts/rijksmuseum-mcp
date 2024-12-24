![rijksmuseum logo](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Logo_Rijksmuseum.svg/799px-Logo_Rijksmuseum.svg.png)

# Rijksmuseum Amsterdam MCP Server

This project implements a Model Context Protocol (MCP) server that interfaces with the Rijksmuseum API. It allows you to search for artworks, retrieve detailed information about specific artworks, access image tiles for artworks, and explore user-created collections from Amsterdam's famous Rijksmuseum.

<a href="https://glama.ai/mcp/servers/4rmiexp64y"><img width="380" height="200" src="https://glama.ai/mcp/servers/4rmiexp64y/badge" alt="Rijksmuseum Server MCP server" /></a>

## Features

- **Search Artworks**: Find artworks in the Rijksmuseum collection using search terms.
- **Artwork Details**: Retrieve detailed information about a specific artwork.
- **Artwork Images**: Access image tiles for high-resolution views of artworks.
- **User Collections**: Explore collections created by users in Rijksstudio.
- **User Collection Details**: Get detailed information about a specific user collection.
- **Open Images in Browser**: Directly open artwork images in your system's default web browser.

## Prerequisites

- Node.js v18 or higher
- An API key from the Rijksmuseum. You can obtain one by registering for a Rijksstudio account. More info can be found here: [https://www.rijksmuseum.nl](https://www.rijksmuseum.nl)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add your Rijksmuseum API key:
     ```
     RIJKSMUSEUM_API_KEY=your-api-key-here
     ```

## Running the Server

To start the MCP server, run:

```bash
npm start
```

The server will run using the standard input/output (stdio) transport.

## Configuring Claude Desktop

To connect Claude Desktop to the Rijksmuseum MCP server, update your `claude_desktop_config.json` file with the following configuration:

```json
{
  "mcpServers": {
    "rijksmuseum": {
      "command": "node",
      "args": ["path/to/your/server/index.js"],
      "env": {
        "RIJKSMUSEUM_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace `path/to/your/server/index.js` with the actual path to your server's entry file and ensure your API key is correctly set.

## Usage

The server provides several tools that can be accessed via MCP clients:

- **search_artwork**: Search for artworks using a query string.
- **get_artwork_details**: Retrieve detailed information about an artwork using its object number.
- **get_artwork_image**: Get image tiles for an artwork using its object number.
- **get_user_sets**: List user-created collections.
- **get_user_set_details**: Retrieve details about a specific user collection.
- **open_image_in_browser**: Open an artwork's image URL directly in your default web browser.

### Example Queries

Here are some example queries you can use with Claude to interact with each tool:

#### Search Artwork
```
"Show me paintings by Rembrandt"
"Find artworks featuring flowers"
"Search for paintings with 'night' in the title"
```

#### Get Artwork Details
```
"Tell me more about The Night Watch"
"Get detailed information about SK-C-5" (The Night Watch's object number)
"What are the details of Vermeer's The Milkmaid?"
```

#### Get Artwork Images
```
"Show me the image tiles for The Night Watch"
"Get the high-resolution image data for SK-C-5"
```

#### User Collections
```
"Show me some user-created collections"
"What are the most recent Rijksstudio sets?"
```

#### User Collection Details
```
"Show me what's in collection 123456"
"Get the details of user set 'Dutch Masters'"
```

#### Open Image in Browser
```
"Open The Night Watch in my browser"
"Show me this painting in my web browser"
"Open the high-res version of this artwork"
```

You can also combine these queries naturally:
```
"Find paintings of flowers and open the first one in my browser"
"Search for Vermeer's works and show me The Milkmaid in my browser"
```

### Why Open in Browser?

The `open_image_in_browser` tool addresses a key limitation: Claude cannot directly display external images in the chat window or as artifacts. This tool provides a workaround by allowing Claude to:

1. Find artwork images through the Rijksmuseum API
2. Open them directly in your system's default web browser

This enables a more interactive experience when discussing artworks, as Claude can help you:
- View the actual artwork being discussed
- Examine specific details mentioned in the conversation
- Compare different artworks by opening multiple browser tabs
- Access high-resolution images for better analysis

The tool works cross-platform (Windows, macOS, and Linux) and seamlessly bridges the gap between Claude's text-based interface and the visual nature of art exploration.

## Error Handling

The server handles errors from the Rijksmuseum API and returns them in a structured format. Ensure that your MCP client is set up to handle these error messages appropriately.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes. 

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.




