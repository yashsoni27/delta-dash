import { F1SignalRClient } from "../ws/f1-signalr";
import { EventEmitter } from "events";
import zlib from "zlib";

interface F1State {
  [key: string]: any;
}
interface QueuedUpdate {
  state: F1State;
  timestamp: number;
  originalTimestamp: number;
}

export class F1LiveService extends EventEmitter {
  private client: F1SignalRClient;
  private state: F1State = {};
  private messageCount = 0;
  public isConnected = false;
  private maxRetries = 5;
  private retryDelay = 3000; // 3 seconds
  private retryCount = 0;
  private emitInterval = 50;

  private delayMs = 0;
  private updateBuffer: QueuedUpdate[] = [];
  private emitTimer: NodeJS.Timeout | null = null;
  private playbackPosition = 0;
  private isDelayActive = false;

  constructor() {
    super();
    this.client = new F1SignalRClient();
    this.setupEventListeners();
    this.startEmitTimer();
  }

  public setDelay(delayMs: number) {
    const now = Date.now();

    console.log(
      `Setting delay to ${delayMs}ms at ${new Date(now).toISOString()}`
    );

    if (delayMs === 0) {
      this.delayMs = 0;
      this.isDelayActive = false;
      this.playbackPosition = this.updateBuffer.length;
      console.log("Switched to real-time mode");
    } else {
      // Set delay - switch to buffered playback mode
      this.delayMs = delayMs;
      this.isDelayActive = true;

      // Find the position in buffer that corresponds to current time - delay
      const targetTime = now - delayMs;
      let foundPosition = 0;

      // Find the latest update that should be played at the target time
      for (let i = this.updateBuffer.length - 1; i >= 0; i--) {
        if (this.updateBuffer[i].originalTimestamp <= targetTime) {
          foundPosition = i;
          break;
        }
      }

      this.playbackPosition = foundPosition;
      console.log(
        `Set delay mode: target time ${new Date(
          targetTime
        ).toISOString()}, playback position: ${foundPosition}/${
          this.updateBuffer.length
        }`
      );
    }
  }

  private startEmitTimer() {
    if (this.emitTimer) {
      clearInterval(this.emitTimer);
    }

    this.emitTimer = setInterval(() => {
      this.processUpdates();
    }, this.emitInterval);
  }

  private processUpdates() {
    const now = Date.now();

    if (!this.isDelayActive || this.delayMs === 0) {
      // Real-time mode - emit current state immediately
      if (Object.keys(this.state).length > 0) {
        this.emit("stateUpdate", {
          ...this.state,
          _timestamp: now,
        });
      }
      return;
    }

    // Delay mode - play from buffer
    if (this.updateBuffer.length === 0) {
      return;
    }

    // Calculate what timestamp we should be playing based on delay
    const targetPlaybackTime = now - this.delayMs;

    // Find updates that should be played now
    let updateToPlay: QueuedUpdate | null = null;
    let newPlaybackPosition = this.playbackPosition;

    // Look for the next update(s) to play
    for (let i = this.playbackPosition; i < this.updateBuffer.length; i++) {
      const update = this.updateBuffer[i];

      if (update.originalTimestamp <= targetPlaybackTime) {
        updateToPlay = update;
        newPlaybackPosition = i + 1;
      } else {
        break; // Future updates, stop here
      }
    }

    // Emit the update if we found one
    if (updateToPlay) {
      this.playbackPosition = newPlaybackPosition;
      this.emit("stateUpdate", {
        ...updateToPlay.state,
        _timestamp: updateToPlay.originalTimestamp,
      });
    }

    // Clean up old buffer entries (keeping last 3 minutes)
    const cutoffTime = now - 3 * 60 * 1000;
    const oldLength = this.updateBuffer.length;
    this.updateBuffer = this.updateBuffer.filter(
      (update) => update.originalTimestamp > cutoffTime
    );

    // Adjust playback position after cleanup
    const removedCount = oldLength - this.updateBuffer.length;
    this.playbackPosition = Math.max(0, this.playbackPosition - removedCount);
  }

  private addToBuffer(newState: F1State) {
    const now = Date.now();

    // Always maintain a buffer (for potential future delays)
    this.updateBuffer.push({
      state: { ...newState },
      timestamp: now,
      originalTimestamp: now,
    });

    // Keep buffer size manageable - store last 3 minutes of data
    const maxBufferTime = 3 * 60 * 1000;
    const cutoffTime = now - maxBufferTime;

    if (this.updateBuffer.length > 5000) {
      // Also limit by count
      const oldLength = this.updateBuffer.length;
      this.updateBuffer = this.updateBuffer.filter(
        (update) => update.originalTimestamp > cutoffTime
      );

      const removedCount = oldLength - this.updateBuffer.length;
      this,this.playbackPosition = Math.max(0, this.playbackPosition - removedCount);
    }
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

      if (Array.isArray(parsedData?.M)) {
        for (const message of parsedData?.M) {
          if (message.M === "feed") {
            this.messageCount++;
            let [field, value] = message.A;

            if (field === "CarData.z" || field === "Position.z") {
              const [parsedField] = field.split(".");
              field = parsedField;
              value = this.parseCompressed(value);
            }

            const newState = this.objectMerge(this.state, { [field]: value });
            this.state = newState;
            this.addToBuffer(this.state);

            // setInterval(() => {
            //   if (this.state) {
            //     this.emit("stateUpdate", {
            //       ...this.state,
            //       _timestamp: Date.now(),
            //     });
            //   }
            // }, this.emitInterval);
          }
        }
      } else if (
        parsedData?.R &&
        Object.keys(parsedData?.R).length &&
        parsedData?.I === "1"
      ) {
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
        this.state = newState;
        this.addToBuffer(this.state);

        // setInterval(() => {
        //   if (this.state) {
        //     this.emit("stateUpdate", {
        //       ...this.state,
        //       _timestamp: Date.now(),
        //     });
        //   }
        // }, this.emitInterval);
      }
    });

    this.client.on("disconnect", () => {
      this.isConnected = false;
      this.state = {};
      this.messageCount = 0;
      this.updateBuffer = [];
      this.playbackPosition = 0;
      this.isDelayActive = false;
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
        "TeamRadio", // Team Radio
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
    if (this.emitTimer) {
      clearInterval(this.emitTimer);
      this.emitTimer = null;
    }
    this.client.disconnect();
    this.isConnected = false;
    this.updateBuffer = [];
    this.playbackPosition = 0;
    this.isDelayActive = false;
  }
}
