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
  private maxRetries = 5;
  private retryDelay = 3000; // 3 seconds
  private retryCount = 0;

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

        this.state = this.objectMerge(this.state, parsedData.R);

        this.emit("stateUpdate", this.state);
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

  private async connectWithRetry(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
      this.retryCount = 0;

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
      console.error(`Connection attempt ${this.retryCount + 1} failed:`, error);

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.emit("retrying", {
          attempt: this.retryCount,
          maxRetries: this.maxRetries,
        });

        setTimeout(() => {
          this.connectWithRetry();
        }, this.retryDelay);
      } else {
        this.emit("connectionFailed");
      }
    }
  }
  
  public async connect() {
    if (!this.isConnected) {
        await this.connectWithRetry();
    }
  }

  public getCurrentState(): F1State {
    return this.state;
  }

  public isSessionActive(): boolean {
    return this.messageCount > 5;
  }

  public disconnect() {
    this.client.disconnect();
    this.isConnected = false;
  }
}
