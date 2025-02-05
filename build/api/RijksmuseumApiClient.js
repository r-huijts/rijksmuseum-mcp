import axios from 'axios';
export class RijksmuseumApiClient {
    constructor(apiKey) {
        this.BASE_URL = 'https://www.rijksmuseum.nl/api/en';
        this.ENDPOINTS = {
            COLLECTION: 'collection'
        };
        this.axiosInstance = axios.create({
            baseURL: this.BASE_URL,
            params: {
                key: apiKey,
                format: 'json'
            }
        });
    }
    async searchArtworks(query, pageSize = 10) {
        const response = await this.axiosInstance.get(this.ENDPOINTS.COLLECTION, {
            params: {
                q: query,
                ps: pageSize
            }
        });
        return response.data.artObjects;
    }
    async getArtworkDetails(objectNumber) {
        const response = await this.axiosInstance.get(`${this.ENDPOINTS.COLLECTION}/${objectNumber}`);
        return response.data;
    }
    async getArtworkImageTiles(objectNumber) {
        const response = await this.axiosInstance.get(`${this.ENDPOINTS.COLLECTION}/${objectNumber}/tiles`);
        return response.data;
    }
    async getUserSets(page = 0, pageSize = 10) {
        const response = await this.axiosInstance.get('usersets', {
            params: { page, pageSize }
        });
        return response.data;
    }
    async getUserSetDetails(setId) {
        const response = await this.axiosInstance.get(`usersets/${setId}`);
        return response.data;
    }
    async getArtistTimeline(artist, maxWorks = 10) {
        const response = await this.axiosInstance.get(this.ENDPOINTS.COLLECTION, {
            params: {
                involvedMaker: artist,
                ps: maxWorks,
                s: 'chronologic',
                imgonly: true
            }
        });
        return response.data.artObjects.map((artwork) => ({
            year: artwork.longTitle.match(/\d{4}/)?.[0] || "Unknown",
            title: artwork.title,
            objectNumber: artwork.objectNumber,
            description: artwork.longTitle,
            image: artwork.webImage ? artwork.webImage.url : null
        }));
    }
}
