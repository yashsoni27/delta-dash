import { BaseApiClient } from "./base";

export class OpenF1ApiClient extends BaseApiClient {
  async fetchFromOpenF1<T>(endpoint: string): Promise<any> {
    try {
      const response: Response = await this.fetch(`${endpoint}`, {
        headers: { "Content-Type": "application/json" },
      });
    
      return response;
    } catch (error) {
      console.error("Failed to fetch from OpenF1");
      return null;
    }
  }
}