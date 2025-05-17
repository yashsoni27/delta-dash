import { JolpicaApiClient } from "../clients/jolpica";
import { RaceService } from "./race.service";

export class DriverService {
  constructor(
    private apiClient: JolpicaApiClient,
    private raceService: RaceService
  ) {}

  // Get Driver details -- unused
  async getDrivers(season: string = "current") {
    try {
      const response = await this.apiClient.fetchFromApi(
        `${season}/drivers`,
        "Driver"
      );
      return response;
    } catch (e) {
      console.log("Error in fetching drivers: ", e);
    }
  }

  // Driver standings
  async getDriverStandings(
    season: string = "current",
    limit: number = 30,
    offset: number = 0
  ) {
    const nextRace = await this.raceService.getNextRace();
    const evoResults = await this.apiClient.fetchFromApi<any>(
      `${season}/${nextRace?.round - 2}/driverStandings`,
      "Standings",
      limit,
      offset
    );
    const result = await this.apiClient.fetchFromApi<any>(
      `${season}/driverStandings`,
      "Standings",
      limit,
      offset
    );

    const currentStandings =
      result.data?.StandingsLists[0]?.DriverStandings || [];
    const previousStandings =
      evoResults.data?.StandingsLists[0]?.DriverStandings || [];

    const standingsWithDifference = currentStandings.map(
      (currentDriver: any, currentIndex: any) => {
        const previousDriver = previousStandings.find(
          (driver: any) =>
            driver.Driver.driverId === currentDriver.Driver.driverId
        );

        const pointsDifference = previousDriver
          ? parseInt(currentDriver.points) - parseInt(previousDriver.points)
          : parseInt(currentDriver.points); // If no previous driver, difference is current points

        let positionDifference = 0;
        if (previousDriver) {
          const previousIndex = previousStandings.findIndex(
            (driver: any) =>
              driver.Driver.driverId === currentDriver.Driver.driverId
          );
          positionDifference = previousIndex - currentIndex;
        }

        return {
          ...currentDriver,
          pointsDifference,
          positionDifference,
        };
      }
    );

    return {
      // standings: result.data?.StandingsLists[0]?.DriverStandings || [],
      standings: standingsWithDifference,
      season: result.data?.StandingsLists[0]?.season || "",
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    };
  }

  // Driver evolution info
  async getDriverEvolution(
    season: string = "current",
    limit: number = 30,
    offset: number = 0
  ) {
    try {
      const driverMapping: any = {};

      const fullSeasonResponse = await this.apiClient.fetchFromApi<any>(
        `${season}/driverStandings`,
        "Standings",
        limit,
        offset
      );
      const fullSeasonData = fullSeasonResponse.data;
      const totalRounds = parseInt(fullSeasonData.StandingsLists[0].round);

      for (let roundNum = 1; roundNum <= totalRounds; roundNum++) {
        const roundResponse = await this.apiClient.fetchWithDelay<any>(
          `/${season}/${roundNum}/driverStandings`,
          "Standings",
          100,
          limit,
          offset
        );
        const roundData = roundResponse.data;
        const standingsList = roundData.StandingsLists[0];
        const currentRound = standingsList.round;

        let nextAvailablePosition = 1;

        for (const standing of standingsList.DriverStandings) {
          const driver = standing.Driver;
          const driverId = driver.driverId;

          // Track occupied positions in this round
          const occupiedPositions = new Set(
            standingsList.DriverStandings.filter(
              (s: any) => s.positionText !== "-"
            ).map((s: any) => parseInt(s.position))
          );

          // Find the first unoccupied position
          let positionValue;
          if (standing.positionText === "-") {
            // Find the next available position, incrementing nextAvailablePosition
            while (occupiedPositions.has(nextAvailablePosition)) {
              nextAvailablePosition++;
            }
            positionValue = nextAvailablePosition.toString();
            nextAvailablePosition++; // Increment for the next blank entry
          } else {
            positionValue = standing.position;
          }

          // Add driver to mapping if new
          if (!driverMapping[driverId]) {
            driverMapping[driverId] = {
              driverId: driverId,
              code: driver.code,
              // name: `${driver.givenName} ${driver.familyName}`,
              name: `${driver.familyName}`,
              nationality: driver.nationality,
              constructorId: standing.Constructors[0]?.constructorId,
              constructors: [
                {
                  round: parseInt(currentRound),
                  constructorId: standing.Constructors[0]?.constructorId,
                },
              ],
              rounds: [],
            };
          } else {
            const currentConstructor =
              standing.Constructors[standing.Constructors.length - 1]
                ?.constructorId;
            const lastConstructor =
              driverMapping[driverId].constructors[
                driverMapping[driverId].constructors.length - 1
              ];

            if (currentConstructor !== lastConstructor.constructorId) {
              driverMapping[driverId].constructors.push({
                round: parseInt(currentRound),
                constructorId: currentConstructor,
              });
              driverMapping[driverId].constructorId = currentConstructor;
            }
          }

          // Add this round's data
          driverMapping[driverId].rounds.push({
            round: parseInt(currentRound),
            position: parseInt(positionValue),
            points: parseFloat(standing.points),
          });
        }
      }

      // Convert mapping to array
      const driverEvolution = Object.values(driverMapping);

      return {
        season: fullSeasonData.season,
        totalRounds: totalRounds,
        driversEvolution: driverEvolution,
      };
    } catch (error) {
      console.error("Error fetching driver evolution:", error);
      return { error: "Failed to fetch driver evolution" };
    }
  }

  async getDriversByConstructor(season: string = "current", constructorId: string) {
    try {
      const response = await this.apiClient.fetchFromApi(
        `${season}/constructors/${constructorId}/drivers`,
        "Driver"
      );
      return response;
    } catch (e) {
      console.log("Error in fetching drivers by constructor: ", e);
    }
  }
}
