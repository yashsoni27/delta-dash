import { F1SignalRClient } from "../ws/f1-signalr";
import { F1DataStream } from "@/types/f1-signalr";
import { SessionInfo } from "@/types/session-info";
import { TimingData, DriverTiming } from "@/types/timing-data";
import { EventEmitter } from "events";
import zlib from "zlib";

interface F1State {
  [key: string]: any;
}
export class F1LiveService extends EventEmitter {
  private client: F1SignalRClient;
  private currentTimingData: { [key: string]: DriverTiming } = {};
  private state: F1State = {};
  private messageCount = 0;
  public isConnected = false;

  constructor() {
    super();
    this.client = new F1SignalRClient();
    this.setupEventListeners();
  }

  private objectMerge(original: F1State = {}, modifier: F1State): F1State {
    if (!modifier) return original;
    const copy = { ...original };

    for (const [key, value] of Object.entries(modifier)) {
      const valueIsObject =
        typeof value === "object" && !Array.isArray(value) && value !== null;

      if (valueIsObject && Object.keys(value).length) {
        copy[key] = this.objectMerge(copy[key], value);
      } else {
        copy[key] = value;
      }
    }
    return copy;
  }

  private setupEventListeners() {
    this.client.on("data", (data) => {
      const parsedData = JSON.parse(data?.data);
      // console.log("inside service: ", parsedData);

      if (parsedData?.R) {
        this.messageCount++;

        // Handle compressed data
        if (parsedData.R["CarData.z"]) {
          parsedData.R.CarData = this.parseCompressed(
            parsedData.R["CarData.z"]
          );
          delete parsedData.R["CarData.z"];
        }

        if (parsedData.R["Position.z"]) {
          parsedData.R.Position = this.parseCompressed(
            parsedData.R["Position.z"]
          );
          delete parsedData.R["Position.z"];
        }

        // Update global state
        this.state = this.objectMerge(this.state, parsedData.R);

        // Emit state update
        console.log("emitting data");
        this.emit("stateUpdate", this.state);

        // if (parsedData?.R?.SessionInfo) {
        //   this.handleSessionInfo(parsedData.R.SessionInfo);
        // }
        // if (parsedData?.R?.TimingData) {
        //   this.handleTimingData(parsedData.R.TimingData);
        // }

        // if (parsedData?.R?.LapCount && parsedData?.R?.TrackStatus) {
        //   this.handleLapStatus(
        //     parsedData.R.LapCount,
        //     parsedData?.R?.TrackStatus
        //   );
        // }
        // if (parsedData?.R?.ExtrapolatedClock) {
        //   this.handleExtrapolatedClock(parsedData.R.ExtrapolatedClock);
        // }
        // if (parsedData?.R?.WeatherData) {
        //   this.handleWeatherData(parsedData.R.WeatherData);
        // }
        // if (parsedData?.R?.TimingAppData) {
        //   this.handleTimingAppData(parsedData.R.TimingAppData);
        // }
        // if (parsedData?.R?.TimingStats) {
        //   this.handleTimingStats(parsedData.R.TimingStats);
        // }
        // if (parsedData?.R?.DriverList) {
        //   this.handleDriverList(parsedData.R.DriverList);
        // }
      }
    });

    this.client.on("disconnect", () => {
      this.isConnected = false;
      this.state = {};
      this.messageCount = 0;
      this.emit("disconnect");
    });
  }

  private parseCompressed(data: string) {
    return JSON.parse(
      zlib.inflateRawSync(Buffer.from(data, "base64")).toString()
    );
  }

  // private handleSessionInfo(data: SessionInfo) {
  //   this.emit("sessionInfo", data);
  // }

  // // Process timing data
  // private handleTimingData(data: any) {
  //   try {
  //     Object.entries(data.Lines).forEach(([driverNumber, timing]) => {
  //       this.currentTimingData[driverNumber] = timing as DriverTiming;
  //     });

  //     // Sort drivers by position
  //     const sortedDrivers = Object.values(this.currentTimingData).sort(
  //       (a, b) => a.Line - b.Line
  //     );

  //     this.emit("timingUpdate", {
  //       timestamp: new Date(),
  //       drivers: sortedDrivers,
  //       raw: this.currentTimingData,
  //     });
  //   } catch (error) {
  //     console.error("Error processing timing data:", error);
  //   }
  // }

  // private handleLapStatus(lapData: any, trackData: any) {
  //   this.emit("lapStatus", {
  //     currentLap: lapData.CurrentLap,
  //     totalLaps: lapData.TotalLaps,
  //     message: trackData.Message,
  //     status: trackData.Status,
  //   });
  // }

  // private handleExtrapolatedClock(data: any) {
  //   this.emit("remainingTime", data.Remaining);
  // }

  // private handleWeatherData(data: any) {
  //   this.emit("weatherData", data);
  // }

  // private handleTimingAppData(data: any) {
  //   this.emit("timingAppData", data);
  // }

  // private handleTimingStats(data: any) {
  //   this.emit("timingStats", data);
  // }

  // private handleDriverList(data: any) {
  //   this.emit("driverList", data);
  // }

  public async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;

        // Subscribe to data streams
        this.client.subscribe([
          "TimingData", // Car timing data for drivers
          "TimingAppData", // Tyre data
          "Heartbeat", // Socket status
          "TimingStats", // Personal bests
          "DriverList", // Driver details
          "WeatherData", // Weather Info
          "TrackStatus", // Track Status (all clear, safety car, yellow, etc)
          "SessionInfo", // Session details
          "SessionData", // Lap timing in UTC
          "LapCount", // Total and current lap
          "RaceControlMessages", // Race control
          "ExtrapolatedClock", // Time left
          // "TopThree", // Top 3 driver details
          "CarData.z", // Compressed Car Data
          "Position.z", // Compressed Position data
          // 'TeamRadio', // Unknown
          // "RcmSeries", // Unknown
        ]);

        this.emit("connect");
      } catch (error) {
        console.error("Connection error:", error);
        throw error;
      }
    }
  }

  // Add method to get current state
  public getCurrentState(): F1State {
    return this.state;
  }

  // Add method to check if session is active
  public isSessionActive(): boolean {
    return this.messageCount > 5;
  }

  public disconnect() {
    this.client.disconnect();
    this.isConnected = false;
  }
}
