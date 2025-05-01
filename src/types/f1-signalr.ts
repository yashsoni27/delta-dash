export type F1DataStream = 
  | "Heartbeat"
  | "ExtrapolatedClock"
  | "TopThree"
  | "TimingStats"
  | "TimingAppData"
  | "WeatherData"
  | "TrackStatus"
  | "DriverList"
  | "RaceControlMessages"
  | "SessionInfo"
  | "SessionData"
  | "LapCount"
  | "TimingData"
  | "CarData.z"
  | "Position.z"
  | "RcmSeries"
  | "TeamRadio";

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