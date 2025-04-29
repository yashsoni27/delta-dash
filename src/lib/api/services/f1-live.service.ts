import { F1SignalRClient } from "../ws/f1-signalr";
import { F1DataStream } from "@/types/f1-signalr";
import { TimingData, DriverTiming } from "@/types/timing-data";
import { EventEmitter } from "events";

export class F1LiveService extends EventEmitter {
  private client: F1SignalRClient;
  private isConnected = false;
  private currentTimingData: { [key: string]: DriverTiming } = {};

  constructor() {
    super();
    this.client = new F1SignalRClient();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on("data", (data) => {
      // Handle different types of data
      console.log("inside service: ", data);
      if (data.M) {
        switch (data.M[0].H) {
          case "TimingData":
            this.handleTimingData(data.M[0].A[0]);
            break;
          case "CarData.z":
            this.handleCarData(data.M[0].A);
            break;
        }
      }
    });

    this.client.on("disconnect", () => {
      this.isConnected = false;
      this.emit("disconnect");
    });
  }

  // Process timing data
  private handleTimingData(data: any) {
    try {
      const parsed = JSON.parse(data);
      console.log("Timing data:", parsed);

      // Update the current timing data
      Object.entries(parsed.R.TimingData.Lines).forEach(
        ([driverNumber, timing]) => {
          this.currentTimingData[driverNumber] = timing as DriverTiming;
        }
      );

      // Sort drivers by position
      const sortedDrivers = Object.values(this.currentTimingData).sort(
        (a, b) => a.Line - b.Line
      );

      // Emit the updated data
      this.emit("timingUpdate", {
        timestamp: new Date(),
        drivers: sortedDrivers,
        raw: this.currentTimingData,
      });
    } catch (error) {
      console.error("Error processing timing data:", error);
    }
  }

  // Process car telemetry data
  private handleCarData(data: any) {
    console.log("Car data:", data);
  }

  public async connect() {
    if (!this.isConnected) {
      try {
      await this.client.connect();
      this.isConnected = true;

      // Subscribe to data streams
      this.client.subscribe([
        "TimingData",
        "Heartbeat",
        // 'CarData.z',
        // 'Position.z',
        // 'WeatherData',
        // 'TrackStatus'
      ]);

      this.emit('connect');
      } catch (error) {
        console.error('Connection error:', error);
        throw error;
      }
    }
  }

  public disconnect() {
    this.client.disconnect();
    this.isConnected = false;
  }

  public getDriverData(driverNumber: string): DriverTiming | undefined {
    return this.currentTimingData[driverNumber];
  }

  public getAllDrivers(): DriverTiming[] {
    return Object.values(this.currentTimingData)
      .sort((a, b) => a.Line - b.Line);
  }
}
