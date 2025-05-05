import { MultviewerClient } from "../clients/multviewer";

export class MultViewerService {
  constructor(private multviewerClient: MultviewerClient) {}

  async getTrack(circuit: string): Promise<any> {
    try {
      const response = await this.multviewerClient.fetchFromMultviewer(
        `circuits/${circuit}/${new Date().getFullYear()}`
      );

      return response;
    } catch (e) {
      console.error("Error in fetching track data:", e);
      return null;
    }
  }
}
