import {
  DriverRepository,
  IDriverStandingRoundData,
  IDriverStaticData,
} from "@/lib/db/driver.repository";
import { JolpicaApiClient } from "../clients/jolpica";
import { RaceService } from "./race.service";

export class DriverService {
  private driverRepository: DriverRepository;

  constructor(
    private apiClient: JolpicaApiClient,
    private raceService: RaceService
  ) {
    this.driverRepository = new DriverRepository();
  }

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
      const lastStoredRound =
        await this.driverRepository.getLastStoredRoundForDriver(season);

      let driverEvolutionResult: any = null;
      let startRoundForApi: number = 1;
      let totalRacesFromApi: number;

      const fullSeasonResponse = await this.apiClient.fetchFromApi<any>(
        `${season}/driverStandings`,
        "Standings",
        1,
        offset
      );

      totalRacesFromApi = parseInt(
        fullSeasonResponse.data.StandingsLists[0].round
      );

      // Fetching from DB of available
      if (lastStoredRound !== null) {
        driverEvolutionResult =
          await this.driverRepository.getDriverEvolutionFromDb(
            season,
            limit,
            offset
          );

        // Return DB data
        if (
          driverEvolutionResult &&
          driverEvolutionResult.totalRounds >= totalRacesFromApi
        ) {
          console.log(
            `Driver evolution data for season ${season} is up-to-date in DB.`
          );
          return driverEvolutionResult;
        }
        // start fetching from the next round
        startRoundForApi = lastStoredRound + 1;
        console.log(
          `DB data for season ${season} is partial. Fetching new rounds from API starting from round ${startRoundForApi}.`
        );
      } else {
        // fetch all rounds from API
        console.log(
          `No driver evolution data in DB for season ${season}. Fetching all rounds from API.`
        );
      }

      const driverMapping: any = driverEvolutionResult
        ? driverEvolutionResult.driversEvolution.reduce(
            (acc: any, driver: any) => {
              acc[driver.driverId] = driver;
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
          `/${season}/${roundNum}/driverStandings`,
          "Standings",
          100,
          limit,
          offset
        );
        const roundData = roundResponse.data;
        const standingsList = roundData.StandingsLists[0];
        const currentRound = parseInt(standingsList.round);

        let nextAvailablePosition = 1;
        const occupiedPositions = new Set(
          standingsList.DriverStandings.filter(
            (s: any) => s.positionText !== "-"
          ).map((s: any) => parseInt(s.position))
        );
        for (const standing of standingsList.DriverStandings) {
          const driver = standing.Driver;
          const driverId = driver.driverId;
          const currentConstructorId =
            standing.Constructors[standing.Constructors.length - 1]
              ?.constructorId;

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

          // Prepare driver static data to save/update
          const driverStatic: IDriverStaticData = {
            driverId: driverId,
            driverCode: driver.code,
            driverName: driver.familyName,
            nationality: driver.nationality,
          };
          await this.driverRepository.saveDriver(driverStatic);

          // Prepare driver standing data for this round to save/update
          const driverStanding: IDriverStandingRoundData = {
            season: season,
            round: currentRound,
            driverId: driverId,
            position: parseInt(positionValue),
            points: parseFloat(standing.points),
            constructorId: currentConstructorId,
          };
          await this.driverRepository.saveDriverStandingRound(driverStanding);

          // Update the driverMapping for the final output
          if (!driverMapping[driverId]) {
            driverMapping[driverId] = {
              driverId: driverId,
              code: driver.code,
              // name: `${driver.givenName} ${driver.familyName}`,
              name: driver.familyName,
              nationality: driver.nationality,
              constructorId: currentConstructorId,
              constructors: [],
              rounds: [],
            };
          }

          const existingConstructors = driverMapping[driverId].constructors;
          const lastConstructorEntry =
            existingConstructors[existingConstructors.length - 1];

          if (
            !lastConstructorEntry ||
            lastConstructorEntry.constructorId !== currentConstructorId
          ) {
            existingConstructors.push({
              round: currentRound,
              constructorId: currentConstructorId,
            });
            // Update the main constructorId for the driver to the latest
            driverMapping[driverId].constructorId = currentConstructorId;
          }

          // Add this round's data
          driverMapping[driverId].rounds.push({
            round: currentRound,
            position: parseInt(positionValue),
            points: parseFloat(standing.points),
          });
        }
      }

      for (const driverId in driverMapping) {
        const driver = driverMapping[driverId];
        if (driver.rounds.length > 0) {
          const lastRoundData = driver.rounds[driver.rounds.length - 1];
          const latestConstructorEntry = driver.constructors.findLast(
            (c: any) => c.round <= lastRoundData.round
          );
          if (latestConstructorEntry) {
            driver.constructorId = latestConstructorEntry.constructorId;
          }
        }
      }

      // Convert mapping to array and sort by position
      const driversEvolution = Object.values(driverMapping).sort(
        (a: any, b: any) => {
          const lastA = a.rounds[a.rounds.length - 1]?.position || Infinity;
          const lastB = b.rounds[b.rounds.length - 1]?.position || Infinity;
          return lastA - lastB;
        }
      );

      return {
        season: season,
        totalRounds: totalRacesFromApi,
        driversEvolution: driversEvolution,
      };
    } catch (error) {
      console.error("Error fetching driver evolution:", error);
      return { error: "Failed to fetch driver evolution" };
    }
  }

  async getDriversByConstructor(
    season: string = "current",
    constructorId: string
  ) {
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
