import {
  BlackCircuitIdToF1Adapter,
  circuitIdToF1Adapter,
  jolpicaToF1MediaConstructor,
} from "@/lib/utils";
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

  async getblackTrackImg(circuitId: string): Promise<string | null> {
    try {
      const circuit = BlackCircuitIdToF1Adapter(circuitId);
      console.log(circuitId, circuit);
      const response = await this.f1MediaClient.fetchFromF1(
        `image/upload/c_lfill,w_3392/v1740000000/common/f1/2025/track/2025track${circuit}whiteoutline.svg`
      );
      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (e) {
      console.error("Error in fetching black track image:", e);
      return null;
    }
  }

  async getDriverNumberLogo(
    firstName: string,
    lastName: string,
    constructorId: string
  ): Promise<string | null> {
    try {
      const driverCode = firstName.substring(0, 3) + lastName.substring(0, 3);
      const arg2 = firstName.substring(0, 3) + lastName.substring(0, 3) + "01";
      const response = await this.f1MediaClient.fetchFromF1(
        `d_default_fallback_image.png/content/dam/fom-website/2018-redesign-assets/drivers/number-logos/${driverCode.toUpperCase()}01.png`
        // `image/upload/c_fit,w_876,h_742/q_auto/v1740000000/common/f1/2025/${jolpicaToF1MediaConstructor(
        //   constructorId
        // )}/${arg2}/2025${jolpicaToF1MediaConstructor(
        //   constructorId
        // )}${arg2}numberwhitefrless.webp`
      );
      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (e) {
      console.log("Error in fetching driver number logo", e);
      return null;
    }
  }

  async getDriverImage(
    firstName: string,
    lastName: string,
    constructorId: string
  ): Promise<string | null> {
    try {
      const firstLetter = firstName.substring(0, 1);
      const arg2 = firstName.substring(0, 3) + lastName.substring(0, 3) + "01";
      const arg1 = arg2 + `_${firstName}_${lastName}`;
      console.log('check', arg1);
      const response = await this.f1MediaClient.fetchFromF1(
        // `d_driver_fallback_image.png/content/dam/fom-website/drivers/${firstLetter}/${arg1}/${arg2}.png`
        `image/upload/c_lfill,w_440/q_auto/d_common:f1:2025:fallback:driver:2025fallbackdriverright.webp/v1740000000/common/f1/2025/${jolpicaToF1MediaConstructor(
          constructorId
        )}/${arg2}/2025${jolpicaToF1MediaConstructor(
          constructorId
        )}${arg2}right.webp`
      );
      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (e) {
      console.log("Error in fetching driver headShot: ", e);
      return null;
    }
  }

  async getCarImage(
    season: string,
    constructor: string
  ): Promise<string | null> {
    try {
      const response = await this.f1MediaClient.fetchFromF1(
        // `d_team_car_fallback_image.png/content/dam/fom-website/teams/${season}/${jolpicaToF1MediaConstructor(
        //   constructor
        // )}.png`
        `image/upload/c_lfill,w_512/q_auto/d_common:f1:2025:fallback:car:2025fallbackcarright.webp/v1740000000/common/f1/2025/${jolpicaToF1MediaConstructor(
          constructor
        )}/2025${jolpicaToF1MediaConstructor(constructor)}carright.webp`
      );

      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (e) {
      console.error("Error in fetching car image: ", e);
      return null;
    }
  }

  // async getConstructorLogo(
  //   season: string,
  //   constructorId: string
  // ): Promise<string | null> {
  //   try {
  //     const response = await this.f1MediaClient.fetchFromF1(
  //       `content/dam/fom-website/teams/${season}/${jolpicaToF1MediaConstructor(
  //         constructorId
  //       )}-logo.png`
  //     );

  //     const imageBlob = await response.blob();
  //     return URL.createObjectURL(imageBlob);
  //   } catch (e) {
  //     return null;
  //   }
  // }
}
