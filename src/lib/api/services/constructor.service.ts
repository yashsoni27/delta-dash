import {
  ConstructorRepository,
  IConstructorStandingRoundData,
  IConstructorStaticData,
} from "@/lib/db/constructor.repository";
import { JolpicaApiClient } from "../clients/jolpica";
import { DriverService } from "./driver.service";
import { RaceService } from "./race.service";

export class ConstructorService {
  private constructorRepository: ConstructorRepository;

  constructor(
    private apiClient: JolpicaApiClient,
    private driverService: DriverService,
    private raceService: RaceService
  ) {
    this.constructorRepository = new ConstructorRepository();
  }

  // Constructor info
  async getConstructors(
    season: string = "current",
    limit: number = 30,
    offset: number = 0
  ) {
    const result = await this.apiClient.fetchFromApi(
      `${season}/constructors`,
      "Constructor",
      limit,
      offset
    );
    return result;
  }

  // Get Driver Constructor Pairings
  async getDriverConstructorPairing(season: string = "current") {
    try {
      // Get Driver constructor pairing, and family Name
      const standingsResponse = await this.driverService.getDriverStandings(
        season
      );
      const driverConstructorObject: Record<
        string,
        { constructorId: string; driverName: string; driverCode?: string }
      > = {};

      standingsResponse.standings.forEach((driver: any) => {
        driver.Constructors.forEach((constructor: any) => {
          driverConstructorObject[driver.Driver.driverId] = {
            constructorId: constructor.constructorId,
            driverName: driver.Driver.familyName,
            driverCode: driver.Driver.code,
          };
        });
      });
      return driverConstructorObject;
    } catch (error) {
      console.error("Error fetching driver constructor pairings:", error);
    }
  }

  // Constructor standings
  async getConstructorStandings(
    season: string = "current",
    limit: number = 30,
    offset: number = 0
  ) {
    const nextRace = await this.raceService.getNextRace();
    const year = new Date().getFullYear();

    const result = await this.apiClient.fetchFromApi<any>(
      `${season}/constructorStandings`,
      "Standings",
      limit,
      offset
    );
    if (year !== Number(nextRace.season)) {
      return {
        standings: result.data?.StandingsLists[0]?.ConstructorStandings,
        season: result.data?.StandingsLists[0]?.season || "",
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      };
    }

    const evoResults = await this.apiClient.fetchFromApi<any>(
      `${season}/${nextRace?.round - 2}/constructorStandings`,
      "Standings",
      limit,
      offset
    );

    const currentStandings =
      result.data?.StandingsLists[0]?.ConstructorStandings || [];
    const previousStandings =
      evoResults.data?.StandingsLists[0]?.ConstructorStandings || [];

    const standingsWithDifference = currentStandings.map(
      (currentConstructor: any, currentIndex: any) => {
        const previousConstructor = previousStandings.find(
          (constructor: any) =>
            constructor.Constructor.constructorId ===
            currentConstructor.Constructor.constructorId
        );

        const pointsDifference = previousConstructor
          ? parseInt(currentConstructor.points) -
            parseInt(previousConstructor.points)
          : parseInt(currentConstructor.points); // If no previous constructor, difference is current points

        let positionDifference = 0;
        if (previousConstructor) {
          const previousIndex = previousStandings.findIndex(
            (constructor: any) =>
              constructor.Constructor.constructorId ===
              currentConstructor.Constructor.constructorId
          );
          positionDifference = previousIndex - currentIndex;
        }

        return {
          ...currentConstructor,
          pointsDifference,
          positionDifference,
        };
      }
    );

    return {
      standings: standingsWithDifference,
      season: result.data?.StandingsLists[0]?.season || "",
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    };
  }

  // Constructor evolution info
  async getConstructorEvolution(
    season: string = "current",
    limit: number = 30,
    offset: number = 0
  ) {
    try {
      const lastStoredRound =
        await this.constructorRepository.getLastStoredRoundForConstructor(
          season
        );

      let constructorEvolutionResult: any = null;
      let startRoundForApi: number = 1;
      let totalRacesFromApi: number;

      const fullSeasonResponse = await this.apiClient.fetchFromApi<any>(
        `${season}/constructorStandings`,
        "Standings",
        1,
        offset
      );
      totalRacesFromApi = parseInt(
        fullSeasonResponse.data.StandingsLists[0].round
      );

      // Fetching from DB if available
      if (lastStoredRound !== null) {
        constructorEvolutionResult =
          await this.constructorRepository.getConstructorEvolutionFromDb(
            season,
            limit,
            offset
          );

        // Return DB data if it's up to date
        if (
          constructorEvolutionResult &&
          constructorEvolutionResult.totalRounds >= totalRacesFromApi
        ) {
          console.log(
            `Constructor evolution data for season ${season} is up-to-date in DB.`
          );
          return constructorEvolutionResult;
        }

        // DB data is partial, start fetching from the next round
        startRoundForApi = lastStoredRound + 1;
        console.log(
          `DB data for season ${season} is partial. Fetching new rounds from API starting from round ${startRoundForApi}.`
        );
      } else {
        // No data in DB, fetch all rounds from API
        console.log(
          `No constructor evolution data in DB for season ${season}. Fetching all rounds from API.`
        );
      }

      const constructorMapping: any = constructorEvolutionResult
        ? constructorEvolutionResult.constructorsEvolution.reduce(
            (acc: any, constructor: any) => {
              acc[constructor.constructorId] = constructor;
              return acc;
            },
            {}
          )
        : {};

      for (
        let roundNum = startRoundForApi;
        roundNum <= totalRacesFromApi;
        roundNum++
      ) {
        const roundResponse = await this.apiClient.fetchWithDelay<any>(
          `/${season}/${roundNum}/constructorStandings`,
          "Standings",
          150,
          limit,
          offset
        );
        const roundData = roundResponse.data;
        const standingsList = roundData.StandingsLists[0];
        const currentRound = standingsList.round;

        for (const standing of standingsList.ConstructorStandings) {
          const constructor = standing.Constructor;
          const constructorId = constructor.constructorId;

          // Prepare constructor static data to save/update
          const constructorStatic: IConstructorStaticData = {
            constructorId: constructorId,
            constructorName: constructor.name,
            nationality: constructor.nationality,
          };
          await this.constructorRepository.saveConstructor(constructorStatic);

          // Prepare constructor standing data for this round to save/update
          const constructorStanding: IConstructorStandingRoundData = {
            season: season,
            round: currentRound,
            constructorId: constructorId,
            position: parseInt(standing.position),
            points: parseFloat(standing.points),
          };
          await this.constructorRepository.saveConstructorStandingRound(
            constructorStanding
          );

          // Update the constructorMapping for the final output
          if (!constructorMapping[constructorId]) {
            constructorMapping[constructorId] = {
              constructorId: constructorId,
              name: constructor.name,
              nationality: constructor.nationality,
              rounds: [],
            };
          }

          // Add this round's data
          constructorMapping[constructorId].rounds.push({
            round: currentRound,
            position: parseInt(standing.position),
            points: parseFloat(standing.points),
          });
        }
      }

      // Convert mapping to array and sort by position
      const constructorsEvolution = Object.values(constructorMapping).sort(
        (a: any, b: any) => {
          const lastA = a.rounds[a.rounds.length - 1]?.position || Infinity;
          const lastB = b.rounds[b.rounds.length - 1]?.position || Infinity;
          return lastA - lastB;
        }
      );

      return {
        season: season,
        totalRounds: totalRacesFromApi,
        constructorsEvolution: constructorsEvolution,
      };
    } catch (error) {
      console.error("Error fetching constructor evolution:", error);
      return { error: "Failed to fetch constructor evolution" };
    }
  }
}
