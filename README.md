![rijksmuseum logo](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Logo_Rijksmuseum.svg/799px-Logo_Rijksmuseum.svg.png)

# Amsterdam's Rijksmuseum MCP Server

This project implements a Model Context Protocol (MCP) server that interfaces with the Rijksmuseum API. It allows you to search for artworks, retrieve detailed information about specific artworks, access image tiles for artworks, and explore user-created collections from Amsterdam's famous Rijksmuseum.

<a href="https://glama.ai/mcp/servers/4rmiexp64y"><img width="380" height="200" src="https://glama.ai/mcp/servers/4rmiexp64y/badge" alt="Rijksmuseum Server MCP server" /></a>

## Features

- **Search Artworks**: Find artworks in the Rijksmuseum collection using search terms.
- **Artwork Details**: Retrieve detailed information about a specific artwork.
- **Artwork Images**: Access image tiles for high-resolution views of artworks.
- **User Collections**: Explore collections created by users in Rijksstudio.
- **User Collection Details**: Get detailed information about a specific user collection.

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

## Error Handling

The server handles errors from the Rijksmuseum API and returns them in a structured format. Ensure that your MCP client is set up to handle these error messages appropriately.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes. 

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.




