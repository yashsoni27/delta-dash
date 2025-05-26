import { convertPitStopTableToJson } from "@/lib/utils";
import { DHLApiClient } from "../clients/dhl";
import { RaceService } from "./race.service";

export class DhlService {
  constructor(
    private apiClient: DHLApiClient,
    private raceService: RaceService
  ) {}

  // Fastest Single Pitstop
  async getSingleFastestPitStop() {
    try {
      const result = await this.getFastestPitstopAndStanding();
      const response = result.season_fastest[0];
      return response;
    } catch (e) {
      console.log("Error in fetching DHL API: ", e);
    }
  }

  async getFastestPitstopAndStanding() {
    try {
      const response = await this.apiClient.fetchFromDHL(
        "fastestPitStopAndStanding"
      );

      return response.chart;
    } catch (e) {
      console.log("Error in DHL API", e);
    }
  }

  async getDriverAvgAndPoints(eventId?: string) {
    try {
      // const response = await fetchFromDHL(
      //   eventId ? `pitStopByEvent?event=${eventId}` : "pitStopByEvent"
      // );
      // const n = response.sort;
      // const Ids = response.event_id;
      // let eventIds = [];
      // for (let i = n; i >= 1; i--) {
      //   eventIds.push(`${Ids - i + 1}`);
      // }
      const roundRes = await this.raceService.getNextRace();
      const round = parseInt(roundRes.round);

      const response = await this.apiClient.fetchFromDHL("avgPitStopAndEventId");
      const Id = response.chart.events[0].id;
      let eventIds = [];
      for (let i = Id; i < Id + round; i++) {
        eventIds.push(`${i}`);
      }

      const allResults = await Promise.all(
        eventIds.map(async (evtId: any) => {
          const response = await this.apiClient.fetchFromDHL(`pitStopByEvent?event=${evtId}`);
          return {
            evtId,
            chart: response?.data?.chart ?? [],
            html: convertPitStopTableToJson(response?.htmlList?.table) ?? [],
          };
        })
      );

      // Track latest constructor for each driver
      const latestDriverTeam: Record<string, string> = {};

      // First pass: Get latest team for each driver
      allResults
        .slice()
        .reverse()
        .forEach((event) => {
          event.html.forEach((driver: any) => {
            if (!latestDriverTeam[driver.driver]) {
              latestDriverTeam[driver.driver] = driver.team;
            }
          });
        });

      const driverPoints: any = {};

      // Second pass: Calculate statistics using latest team
      allResults.forEach((event) => {
        event.html.forEach((driver: any) => {
          const driverName = driver.driver;
          const latestTeam = latestDriverTeam[driverName];

          if (!driverPoints[driverName]) {
            driverPoints[driverName] = {
              lastName: driverName,
              team: latestTeam, // Use latest team
              points: 0,
              totalDuration: 0,
              pitStopCount: 0,
              avgDuration: 0,
            };
          }

          driverPoints[driverName].points += driver.points;
          if (driver.time > 0) {
            driverPoints[driverName].totalDuration += driver.time;
            driverPoints[driverName].pitStopCount++;
          }
        });
      });

      // Calculate average durations
      Object.values(driverPoints).forEach((driver: any) => {
        driver.avgDuration =
          driver.pitStopCount > 0
            ? Number((driver.totalDuration / driver.pitStopCount).toFixed(2))
            : 0;

        delete driver.totalDuration;
      });

      const result = Object.values(driverPoints);

      return result;
    } catch (e) {
      console.log("Error in DHL API: ", e);
    }
  }

  async getAvgPitStopAndEvtId() {
    try {
      const response = await this.apiClient.fetchFromDHL("avgPitStopAndEventId");
      const { events, values } = response.chart;
  
      // Create mapping of event IDs to abbreviations
      const eventMap = events.reduce(
        (acc: Record<string, string>, event: any) => {
          acc[event.id] = event.abbr;
          return acc;
        },
        {}
      );
  
      // Transform values to use abbreviations instead of event IDs
      const transformedValues = values.map((team: any) => ({
        ...team,
        duration: Object.entries(team.duration).reduce(
          (acc: Record<string, number>, [eventId, duration]) => {
            acc[eventMap[eventId]] = duration as number;
            return acc;
          },
          {}
        ),
      }));
  
  
      return { events: events, values: transformedValues };
    } catch (e) {
      console.log("Error in DHL API: ", e);
    }
  }

  async getFastestLapStanding() {
    try {
      const response = await this.apiClient.fetchFromDHL("fastestLapStanding");
  
      return response.chart;
    } catch (e) {
      console.log("Error in DHL API", e);
    }
  }
  
  async getFastestLapVideo(eventId?: string) {
    try {
      const response = await this.apiClient.fetchFromDHL(
        eventId ? `fastestLapVideo?event=${eventId}` : "fastestLapVideo"
      );
  
      const videoUrls = {
        desktopVideo:
          response?.htmlList?.video.match(/data-src-desktop="([^"]*)"/)?.[1] ||
          "",
        mobileVideo:
          response?.htmlList?.video.match(/data-src-mobile="([^"]*)"/)?.[1] || "",
        desktopPoster:
          response?.htmlList?.video.match(/data-poster-desktop="([^"]*)"/)?.[1] ||
          "",
        mobilePoster:
          response?.htmlList?.video.match(/data-poster-mobile="([^"]*)"/)?.[1] ||
          "",
      };
  
      return videoUrls;
    } catch (e) {
      console.log("Error in fetching video from DHL: ", e);
    }
  }

}
