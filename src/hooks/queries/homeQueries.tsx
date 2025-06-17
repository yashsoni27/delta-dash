import { dhlService, raceService } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface PitStopInfo {
  duration: string;
  lastName: string;
  abbreviation: string;
  shortTitle: string;
}

export interface FastestLapStanding {
  firstName: string;
  lastName: string;
  flCount: number;
}

export interface RaceInfo {
  season: string;
  round: string;
  raceName: string;
}

export interface RaceResult {
  Driver: {
    familyName: string;
  };
}

export function useSingleFastestPitStopQuery() {
  return useQuery({
    queryKey: ["fastestPitStop"],
    queryFn: async function getFastestPitStop() {
      const data = await dhlService.getSingleFastestPitStop();
      return data as PitStopInfo;
    },
  });
}

export function useFastestLapStandingQuery() {
  return useQuery({
    queryKey: ["fastestLapStanding"],
    queryFn: async function getFastestLapStanding() {
      const data = await dhlService.getFastestLapStanding();

      if (data && data.standings[0]) {
        return data.standings[0] as FastestLapStanding;
      }

      return Promise.reject("DHL API error for fastest lap data");
    },
  });
}

export function usePreviousRacesQuery() {
  return useQuery({
    queryKey: ["previousRaces"],
    queryFn: async function getPreviousRaces() {
      return (await raceService.getPreviousRaces()) as RaceInfo[];
    },
  });
}

export function useLastRaceWinnerQuery() {
  const previousRacesQueryResponse = usePreviousRacesQuery();

  return useQuery({
    queryKey: ["lastRaceWinner"],
    queryFn: async () => {
      if (!previousRacesQueryResponse.data?.[0]) return null;

      const season = previousRacesQueryResponse.data[0].season;
      const round = previousRacesQueryResponse.data[0].round;

      const lastRaceResult: RaceResult[] = await raceService.getRaceResults(
        season,
        round
      );

      return {
        raceName: previousRacesQueryResponse.data[0].raceName,
        winner:
          lastRaceResult && lastRaceResult[0] && lastRaceResult[0].Driver
            ? lastRaceResult[0].Driver.familyName
            : null,
      };
    },
    enabled: !!previousRacesQueryResponse.data?.[0],
  });
}
