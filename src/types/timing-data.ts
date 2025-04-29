export interface TimingData {
  Lines: {
    [key: string]: DriverTiming;
  }
}

export interface DriverTiming {
  GapToLeader: string;
  IntervalToPositionAhead: {
    Value: string;
    Catching: boolean;
  };
  Line: number;
  Position: string;
  ShowPosition: boolean;
  RacingNumber: string;
  Retired: boolean;
  InPit: boolean;
  PitOut: boolean;
  Stopped: boolean;
  Status: number;
  NumberOfLaps?: number;
  NumberOfPitStops?: number;
  Sectors: SectorData[];
  Speeds: SpeedData;
  BestLapTime: LapTime;
  LastLapTime: LapTime;
}

interface SectorData {
  Stopped: boolean;
  PreviousValue?: string;
  Value?: string;
  Status: number;
  OverallFastest: boolean;
  PersonalFastest: boolean;
  Segments: { Status: number }[];
}

interface SpeedData {
  I1: SpeedValue;
  I2: SpeedValue;
  FL: SpeedValue;
  ST: SpeedValue;
}

interface SpeedValue {
  Value: string;
  Status: number;
  OverallFastest: boolean;
  PersonalFastest: boolean;
}

interface LapTime {
  Value: string;
  Lap?: number;
  Status?: number;
  OverallFastest?: boolean;
  PersonalFastest?: boolean;
}