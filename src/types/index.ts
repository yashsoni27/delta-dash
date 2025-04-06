// Type definitions

export interface SeasonData {
  season: string;
  currentRound: number;
  totalRounds: number;
  status: string;
}

export interface DriverStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  driverId: string;
  firstName: string;
  lastName: string;
  constructor: string;
  constructorId: string;
  nationality: string;
}

export interface ConstructorStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  constructorId: string;
  name: string;
  nationality: string;
}

export interface Race {
  season: string;
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  country: string;
  locality: string;
  date: string;
  time: string;
  winner?: string;
}

export interface DriverInfo {
  driverId: string;
  permanentNumber: string;
  code: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  imageUrl?: string;
  team: string;
  biography?: string;
  championships?: number;
  wins?: number;
  podiums?: number;
  careerPoints?: number;
}

export interface ConstructorInfo {
  constructorId: string;
  name: string;
  nationality: string;
  logoUrl?: string;
  carImageUrl?: string;
  headquarters?: string;
  teamPrincipal?: string;
  technicalDirector?: string;
  championships?: number;
  wins?: number;
  podiums?: number;
  polePositions?: number;
  history?: string;
}

export interface RaceResults {
  season: string;
  round: number;
  raceName: string;
  circuitName: string;
  date: string;
  time: string;
  circuitInfo?: {
    name: string;
    location: string;
    country: string;
    length: string;
    laps: number;
    firstGrandPrix: string;
    lapRecord: string;
    imageUrl?: string;
  };
  results: Array<{
    position: number;
    positionText: string;
    points: number;
    driverId: string;
    driverName: string;
    constructorId: string;
    constructorName: string;
    grid: number;
    laps: number;
    status: string;
    time?: string;
  }>;
  fastestLap?: {
    driverName: string;
    lap: number;
    time: string;
  };
}

export interface driverEvo {
  code: string;
  driverId: string;
  constructorId: string;
  name: string;
  nationality: string;
  rounds: {
    round: number | string;
    position: number;
    points: number;
  }[];
}

export interface constructorEvo {
  constructorId: string;
  name: string;
  nationality: string;
  rounds: {
    round: number | string;
    position: number;
    points: number;
  }[];
}

export interface Evolutions {
  season: string;
  totalRounds: number;
  driversEvolution?: driverEvo[];
  constructorsEvolution?: constructorEvo[];
}

export interface RankingEvolutionProps {
  title: string;
  rankings: Evolutions;
}
export interface StandingEvolutionProps {
  title: string;
  standings: Evolutions;
}



export interface Column {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: any) => React.ReactNode;
  tooltip?: (value: any, item: any) => string | null;
}

export interface TableProps {
  heading?: string;
  columns: Column[];
  data: any[];
  className?: string;
  onRowClick?: (item: any) => void;
}