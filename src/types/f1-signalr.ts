export type F1DataStream = 
  | "Heartbeat"
  | "CarData.z"
  | "Position.z"
  | "ExtrapolatedClock"
  | "TopThree"
  | "RcmSeries"
  | "TimingStats"
  | "TimingAppData"
  | "WeatherData"
  | "TrackStatus"
  | "DriverList"
  | "RaceControlMessages"
  | "SessionInfo"
  | "SessionData"
  | "LapCount"
  | "TimingData";

export interface SignalRNegotiateResponse {
  Url: string;
  ConnectionToken: string;
  ConnectionId: string;
  KeepAliveTimeout: number;
  DisconnectTimeout: number;
  ConnectionTimeout: number;
  TryWebSockets: boolean;
  ProtocolVersion: string;
  TransportConnectTimeout: number;
  LongPollDelay: number;
}

export interface SignalRMessage {
  H: string;
  M: string;
  A: F1DataStream[][];
  I: number;
}