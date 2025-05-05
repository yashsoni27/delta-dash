import { BaseApiClient } from "./base";

export class MultviewerClient extends BaseApiClient {
  async fetchFromMultviewer(endpoint: string | number): Promise<any> {
    try {
      const response: Response = await this.fetch(`${endpoint}`, {
        headers: { "Content-Type": "application/json" },
      });

      return response;
    } catch (error) {
      console.error("Failed to fetch Multviewer data");
      return null;
    }
  }
}
