import { JolpicaApiClient } from "../clients/jolpica";
import { DriverService } from "./driver.service";
import { RaceService } from "./race.service";

export class ConstructorService {
  constructor(
    private apiClient: JolpicaApiClient,
    private driverService: DriverService,
    private raceService: RaceService
  ) {}

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
      const constructorMapping: any = {};

      const fullSeasonResponse = await this.apiClient.fetchFromApi<any>(
        `${season}/constructorStandings`,
        "Standings",
        limit,
        offset
      );
      const fullSeasonData = fullSeasonResponse.data;
      const totalRounds = parseInt(fullSeasonData.StandingsLists[0].round);

      for (let roundNum = 1; roundNum <= totalRounds; roundNum++) {
        // const roundResponse = await fetchFromApi<any>(
        //   `/${season}/${roundNum}/constructorStandings`,
        //   "Standings",
        //   limit,
        //   offset
        // );
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

          // Add driver to mapping if new
          if (!constructorMapping[constructorId]) {
            constructorMapping[constructorId] = {
              constructorId: constructorId,
              // code: constructor.code,
              name: constructor.name,
              nationality: constructor.nationality,
              rounds: [],
            };
          }

          // Add this round's data
          constructorMapping[constructorId].rounds.push({
            round: parseInt(currentRound),
            position: parseInt(standing.position),
            points: parseFloat(standing.points),
          });
        }
      }

      // Convert mapping to array
      const constructorEvolution = Object.values(constructorMapping);

      return {
        season: fullSeasonData.season,
        totalRounds: totalRounds,
        constructorsEvolution: constructorEvolution,
      };
    } catch (error) {
      console.error("Error fetching constructor evolution:", error);
      return { error: "Failed to fetch constructor evolution" };
    }
  }
}
