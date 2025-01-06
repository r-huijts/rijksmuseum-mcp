import dotenv from 'dotenv';

export class Config {
  private static instance: Config;
  private readonly apiKey: string;

  private constructor() {
    dotenv.config();
    
    const apiKey = process.env.RIJKSMUSEUM_API_KEY;
    if (!apiKey) {
      throw new Error("RIJKSMUSEUM_API_KEY environment variable is required");
    }
    this.apiKey = apiKey;
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  getApiKey(): string {
    return this.apiKey;
  }
} 