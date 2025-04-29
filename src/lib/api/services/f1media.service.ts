import { circuitIdToF1Adapter } from "@/lib/utils";
import { F1MediaApiClient } from "../clients/f1media";

export class F1MediaService {
  constructor(private f1MediaClient: F1MediaApiClient) {}

  async getTrackImg(circuitId: string): Promise<string | null> {
    try {
      const circuit = circuitIdToF1Adapter(circuitId);

      const response = await this.f1MediaClient.fetchFromF1(
        `${circuit}_Circuit`
      );

      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (e) {
      console.error("Error in fetching track image:", e);
      return null;
    }
  }
}
