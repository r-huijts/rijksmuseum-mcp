import dotenv from 'dotenv';
export class Config {
    constructor() {
        dotenv.config();
        const apiKey = process.env.RIJKSMUSEUM_API_KEY;
        if (!apiKey) {
            throw new Error("RIJKSMUSEUM_API_KEY environment variable is required");
        }
        this.apiKey = apiKey;
    }
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    getApiKey() {
        return this.apiKey;
    }
}
