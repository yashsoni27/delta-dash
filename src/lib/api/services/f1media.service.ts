import { circuitIdToF1Adapter } from "@/lib/utils";
import { F1MediaApiClient } from "../clients/f1media";

export class F1MediaService {
  constructor(private f1MediaClient: F1MediaApiClient) {}

  async getTrackImg(circuitId: string): Promise<string | null> {
    try {
      const circuit = circuitIdToF1Adapter(circuitId);

      const response = await this.f1MediaClient.fetchFromF1(
        `image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${circuit}_Circuit`
      );

      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (e) {
      console.error("Error in fetching track image:", e);
      return null;
    }
  }

  async getDriverNumberLogo(driverCode: string): Promise<string | null> {
    try {
      const response = await this.f1MediaClient.fetchFromF1(
        `d_default_fallback_image.png/content/dam/fom-website/2018-redesign-assets/drivers/number-logos/${driverCode.toUpperCase()}01.png`
      );
      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (e) {
      console.log("Error in fetching driver number logo", e);
      return null;
    }
  }
}
