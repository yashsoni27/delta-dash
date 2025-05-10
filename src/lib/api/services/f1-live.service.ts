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
  private retryDelay = 3000; // 2 seconds
  private retryCount = 0;
  private lastEmitTime = 0;
  private throttleInterval = 400;

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

  private hasStateChanged(newState: F1State): boolean {
    const stringify = (obj: any) => JSON.stringify(obj);
    return stringify(this.state) !== stringify(newState);
  }

  private setupEventListeners() {
    this.client.on("data", (data) => {
      const now = Date.now();
      const parsedData = JSON.parse(data?.data);

      if (Array.isArray(parsedData.M)) {
        for (const message of parsedData.M) {
          if (message.M === "feed") {
            this.messageCount++;
            let [field, value] = message.A;

            if (field === "CarData.z" || field === "Position.z") {
              const [parsedField] = field.split(".");
              field = parsedField;
              value = this.parseCompressed(value);
            }

            const newState = this.objectMerge(this.state, { [field]: value });
            
            if (this.hasStateChanged(newState) && 
                now - this.lastEmitTime >= this.throttleInterval) {
              this.state = newState;
              this.emit("stateUpdate", {
                ...this.state,
                _timestamp: now,
              });
              this.lastEmitTime = now;
            }
          }
        }
      }

      if (parsedData?.R) {
        // if (parsedData.R && Object.keys(parsedData.R).length && parsedData.I === "1") {
        this.messageCount++;

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

        const newState = this.objectMerge(this.state, parsedData.R);

        if (
          this.hasStateChanged(newState) &&
          now - this.lastEmitTime >= this.throttleInterval
        ) {
          this.state = newState;
          this.emit("stateUpdate", {
            ...this.state,
            _timestamp: now,
          });
          this.lastEmitTime = now;
        }
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
        'TeamRadio', // Team Radio
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
