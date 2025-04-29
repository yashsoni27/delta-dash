import { BaseApiClient } from "./base";

export class F1MediaApiClient extends BaseApiClient {
  async fetchFromF1(endpoint: string): Promise<Response> {
    try {
      const response: Response = await this.fetchRaw(`${endpoint}`);

      if (!response.ok) throw new Error(`F1 media error: ${response.status}`);

      return response;
    } catch (error) {
      console.error("Failed to fetch from F1 media", error);
      throw error;
    }
  }
}
