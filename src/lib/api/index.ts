import { API_CONFIG } from "./config";
import { JolpicaApiClient } from "./clients/jolpica";
import { DHLApiClient } from "./clients/dhl";
import { RaceService } from "./services/race.service";
import { ConstructorService } from "./services/constructor.service";
import { DriverService } from "./services/driver.service";
import { StatsService } from "./services/stats.service";
import { DhlService } from "./services/dhl.service";
import { OpenF1ApiClient } from "./clients/openf1";
import { F1MediaApiClient } from "./clients/f1media";
import { F1MediaService } from "./services/f1media.service";
import { F1LiveService } from "./services/f1-live.service";
import { MultviewerClient } from "./clients/multviewer";
import { MultViewerService } from "./services/multviewer.service";

export class ApiFactory {
  private static jolpicaClient = new JolpicaApiClient(API_CONFIG.JOLPICA);
  private static dhlClient = new DHLApiClient(API_CONFIG.DHL);
  private static openF1Client = new OpenF1ApiClient(API_CONFIG.OPEN_F1);
  private static f1MediaClient = new F1MediaApiClient(API_CONFIG.F1_MEDIA);
  private static multViewerClient = new MultviewerClient(API_CONFIG.MULTVIEWER)

  static getRaceService() {
    return new RaceService(
      this.jolpicaClient,
      this.openF1Client,
      this.f1MediaClient
    );
  }

  static getDriverService() {
    return new DriverService(this.jolpicaClient, this.getRaceService());
  }

  static getConstructorService() {
    return new ConstructorService(
      this.jolpicaClient,
      this.getDriverService(),
      this.getRaceService()
    );
  }

  static getStatsService() {
    return new StatsService(
      this.jolpicaClient,
      this.getConstructorService(),
      this.getRaceService()
    );
  }

  static getDhlService() {
    return new DhlService(this.dhlClient, this.getRaceService());
  }

  static getF1MediaService() {
    return new F1MediaService(this.f1MediaClient);
  }

  static getMultViewerService() {
    return new MultViewerService(this.multViewerClient);
  }

  static getF1LiveService() {
    return new F1LiveService();
  }
}

export const raceService = ApiFactory.getRaceService();
export const driverService = ApiFactory.getDriverService();
export const constructorService = ApiFactory.getConstructorService();
export const statsService = ApiFactory.getStatsService();
export const dhlService = ApiFactory.getDhlService();
export const f1MediaService = ApiFactory.getF1MediaService();
export const f1LiveService = ApiFactory.getF1LiveService();
export const multViewerService = ApiFactory.getMultViewerService();