import {
  F1DataStream,
  SignalRMessage,
  SignalRNegotiateResponse,
} from "@/types/f1-signalr";
import { EventEmitter } from "events";

export class F1SignalRClient extends EventEmitter {
  private static readonly BASE_URL = "livetiming.formula1.com/signalr";
  private static readonly HUB_NAME = "Streaming";
  private socket: WebSocket | null = null;
  private connectionToken: string | null = null;
  private cookie: string | null = null;
  private messageId = 1;

  constructor() {
    super();
  }

  private async negotiate(): Promise<void> {
    try {
      const response = await fetch("/f1-live/negotiate");
      if (!response.ok)
        throw new Error(`Negotiation failed: ${response.status}`);

      const data = await response.json();
      this.connectionToken = data.ConnectionToken;
      this.cookie = data.cookie;

      if (!this.connectionToken || !this.cookie) {
        throw new Error("Failed to get connection token or cookie");
      }
    } catch (error) {
      console.error("SignalR negotiation failed:", error);
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    if (!this.connectionToken || !this.cookie) {
      throw new Error("Negotiate must be called before connecting");
    }

    const hub = encodeURIComponent(
      JSON.stringify([{ name: F1SignalRClient.HUB_NAME }])
    );
    const encodedToken = encodeURIComponent(this.connectionToken);
    const url = `wss://${F1SignalRClient.BASE_URL}/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodedToken}&connectionData=${hub}`;

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log("F1 SignalR Connected");
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            this.emit("data", event);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
          reject(error);
        };

        this.socket.onclose = () => {
          console.log("F1 SignalR Connection Closed");
          this.emit("disconnect");
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  public async connect(): Promise<void> {
    try {
      await this.negotiate();
      await this.connectWebSocket();
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
    }
  }

  public subscribe(streams: F1DataStream[]): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Socket not connected");
    }

    const message: SignalRMessage = {
      H: F1SignalRClient.HUB_NAME,
      M: "Subscribe",
      A: [streams],
      I: this.messageId++,
    };

    this.socket.send(JSON.stringify(message));
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectionToken = null;
    this.cookie = null;
  }
}
