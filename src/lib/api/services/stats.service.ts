import { getConstructorHex, minuteStrToSeconds } from "@/lib/utils";
import { JolpicaApiClient } from "../clients/jolpica";
import { LapTiming } from "@/types";
import { ConstructorService } from "./constructor.service";
import { RaceService } from "./race.service";

export class StatsService {
  constructor(
    private apiClient: JolpicaApiClient,
    private constructorService: ConstructorService,
    private raceService: RaceService
  ) {}

  // Get fastest lap info
  async getFastestLaps(
    season: string = "current",
    round: string,
    limit: number = 100,
    offset: number = 0
  ) {
    // Get Driver constructor pairing, and family Name
    const driverConstructorObject =
      await this.constructorService.getDriverConstructorPairing(season);

    const initialResult = await this.apiClient.fetchFromApi(
      `${season}/${round}/laps`,
      "Race",
      1,
      0
    );

    const totalLaps = initialResult.total;
    const batchSize = 80;
    const requiredRequests = Math.ceil(totalLaps / batchSize);
    const offsets = Array.from(
      { length: requiredRequests },
      (_, i) => i * batchSize
    );

    const allResults: any = [];
    const concurrencyLimits = 3;

    for (let i = 0; i < offsets.length; i += concurrencyLimits) {
      const batch = offsets.slice(i, i + concurrencyLimits);
      const batchResults = await Promise.all(
        batch.map((offset, index) =>
          this.apiClient.fetchWithDelay<{ data: any }>(
            `${season}/${round}/laps`,
            "Race",
            // index * 100,
            batchSize,
            batchSize,
            offset
          )
        )
      );
      allResults.push(...batchResults);
    }

    const allLapTimes: LapTiming[] = [];

    // Process laps
    const driverMap = new Map<string, LapTiming>();

    for (const result of allResults) {
      const laps = result.data.Races[0].Laps;

      for (const lap of laps) {
        for (const timing of lap.Timings) {
          const formattedTime = minuteStrToSeconds(timing.time);

          allLapTimes.push({
            driverId: timing.driverId,
            lapNumber: lap.number,
            time: formattedTime,
            constructorId:
              driverConstructorObject?.[timing.driverId]?.constructorId ??
              "Unknown",
            familyName:
              driverConstructorObject?.[timing.driverId]?.driverName ??
              timing.driverId,
            driverCode:
              driverConstructorObject?.[timing.driverId]?.driverCode ??
              timing.driverId,
          });

          // Update driver fastest lap
          if (
            !driverMap.has(timing.driverId) ||
            formattedTime < driverMap.get(timing.driverId)!.time
          ) {
            driverMap.set(timing.driverId, {
              driverId: timing.driverId,
              lapNumber: lap.number,
              time: formattedTime,
              constructorId:
                driverConstructorObject?.[timing.driverId]?.constructorId ??
                "Unknown",
              familyName:
                driverConstructorObject?.[timing.driverId]?.driverName ??
                "Unknown",
            });
          }
        }
      }
    }

    // Get top 20 fastest laps overall
    const fastest20Laps = [...allLapTimes]
      .sort((a, b) => a.time - b.time)
      .slice(0, 20);

    return {
      drivers: Array.from(driverMap.values()).sort((a, b) => a.time - b.time),
      allLaps: allLapTimes.sort((a, b) => a.lapNumber - b.lapNumber),
      fastest20Laps: fastest20Laps,
    };
  }

  // Get Head to Head data
  async getComparisonData(season: string = "current", constructorId: string) {
    const raceResults = await this.apiClient.fetchFromApi(
      `${season}/constructors/${constructorId}/results`,
      "Race",
      100,
      0
    );
    const sprintResults = await this.apiClient.fetchFromApi(
      `${season}/constructors/${constructorId}/sprint`,
      "Race",
      100,
      0
    );

    // Track all drivers and their last appearance
    const driversMap = new Map<
      string,
      {
        driverId: string;
        givenName: string;
        familyName: string;
        driverNo: string;
        lastRound: number;
        races: number;
        raceWins: number;
        sprintWins: number;
        wins: number;
        qualifying: number;
        qualifyingWins: number;
        poles: number;
        points: number;
        podiums: number;
        bestFinish: number;
        bestGrid: number;
        dnf: number;
      }
    >();

    // Process race results first to set driver identities
    if ((raceResults?.data as any)?.Races) {
      const races = (raceResults?.data as any)?.Races;

      [...races].reverse().forEach((race: any) => {
        const round = parseInt(race.round);

        race.Results.forEach((result: any) => {
          const driverId = result.Driver.driverId;

          // Add or update driver info
          if (!driversMap.has(driverId)) {
            driversMap.set(driverId, {
              driverId: result.Driver.driverId,
              givenName: result.Driver.givenName,
              familyName: result.Driver.familyName,
              driverNo: result.Driver.permanentNumber,
              lastRound: round,
              races: 0,
              raceWins: 0,
              sprintWins: 0,
              wins: 0,
              qualifying: 0,
              qualifyingWins: 0,
              poles: 0,
              points: 0,
              podiums: 0,
              bestFinish: Infinity,
              bestGrid: Infinity,
              dnf: 0,
            });
          }

          const driver = driversMap.get(driverId)!;

          // Update statistics
          driver.races++;
          driver.points += parseFloat(result.points);

          const position = parseInt(result.position);
          const gridPosition = parseInt(result.grid);

          // Update best finish
          if (position < driver.bestFinish) {
            driver.bestFinish = position;
          }

          // Update best grid
          if (gridPosition < driver.bestGrid) {
            driver.bestGrid = gridPosition;
          }

          // Count poles
          if (gridPosition === 1) {
            driver.poles++;
          }

          // Count podiums
          if (position <= 3) {
            driver.podiums++;
          }

          // Count wins
          if (position === 1) {
            driver.wins++;
          }

          // Count DNFs
          if (result.status !== "Finished" && !result.status.includes("Lap")) {
            driver.dnf++;
          }
        });

        // Process qualifying and race battles if we have two drivers
        if (race.Results.length === 2) {
          const [result1, result2] = race.Results;
          const driver1 = driversMap.get(result1.Driver.driverId)!;
          const driver2 = driversMap.get(result2.Driver.driverId)!;

          // Qualifying battle
          const grid1 = parseInt(result1.grid);
          const grid2 = parseInt(result2.grid);

          driver1.qualifying++;
          driver2.qualifying++;

          if (grid1 < grid2) {
            driver1.qualifyingWins++;
          } else if (grid2 < grid1) {
            driver2.qualifyingWins++;
          }

          // Race battle
          const pos1 = parseInt(result1.position);
          const pos2 = parseInt(result2.position);

          if (pos1 < pos2) {
            driver1.raceWins++;
          } else if (pos2 < pos1) {
            driver2.raceWins++;
          }
        }
      });
    }

    // Process sprint results
    if ((sprintResults?.data as any)?.Races) {
      const sprints = (sprintResults?.data as any)?.Races;

      sprints.forEach((sprint: any) => {
        if (!sprint.SprintResults) return;

        // Process sprint battles if we have two drivers
        if (sprint.SprintResults.length === 2) {
          const [result1, result2] = sprint.SprintResults;
          const driver1 = driversMap.get(result1.Driver.driverId)!;
          const driver2 = driversMap.get(result2.Driver.driverId)!;

          // Update points from sprint
          driver1.points += parseFloat(result1.points);
          driver2.points += parseFloat(result2.points);

          // Compare sprint results between teammates
          const pos1 = parseInt(result1.position);
          const pos2 = parseInt(result2.position);

          // Add sprint win to whoever finished ahead
          if (pos1 < pos2) {
            driver1.sprintWins++;
          } else if (pos2 < pos1) {
            driver2.sprintWins++;
          }
        } else {
          // Handle case with just one driver or more than two
          sprint.SprintResults.forEach((result: any) => {
            const driverId = result.Driver.driverId;

            // Make sure driver exists in our map
            if (driversMap.has(driverId)) {
              const driver = driversMap.get(driverId)!;

              // Update points from sprint
              driver.points += parseFloat(result.points);
            }
          });
        }
      });
    }

    // Get the two most recent drivers
    const sortedDrivers = Array.from(driversMap.values())
      .sort((a, b) => b.lastRound - a.lastRound)
      .slice(0, 2);

    return {
      season,
      constructorId,
      color: getConstructorHex(constructorId),
      driver1: sortedDrivers[0],
      driver2: sortedDrivers[1],
    };
  }

  // Finishing stats -- for Stats and Pt Distribution
  async getFinishingStats(season: string = "current") {
    try {
      const driverStats: Record<string, any> = {};
      const constructorStats: Record<string, any> = {};
      const driverPointsByRound: Record<string, any> = {};
      const constructorPointsByRound: Record<string, any> = {};

      const previousRaceResponse = await this.raceService.getPreviousRaces();
      const gpNames = previousRaceResponse.reduce(
        (acc: Record<string, string>, race: any) => {
          const gpName = race.raceName.replace("Grand Prix", "").trim();
          const abbreviation = gpName.includes(" ")
            ? gpName
                .split(" ")
                .map((word: any) => word[0])
                .join("")
            : gpName.slice(0, 3).toUpperCase();
          acc[race.round] = abbreviation;
          return acc;
        },
        {}
      );
      const initialResult = await this.apiClient.fetchFromApi(
        `${season}/results`,
        "Race",
        1,
        0
      );
      const totalRaces = parseInt(previousRaceResponse[0].round);

      const totalResults = initialResult?.total;
      const batchSize = 80;
      const requiredRequests = Math.ceil(totalResults / batchSize);
      const offsets = Array.from(
        { length: requiredRequests },
        (_, i) => i * batchSize
      );

      const concurrencyLimits = 3;

      // Fetch all race results in batches
      for (let i = 0; i < offsets.length; i += concurrencyLimits) {
        const batch = offsets.slice(i, i + concurrencyLimits);
        const batchResults = await Promise.all(
          batch.map((offset, index) =>
            this.apiClient.fetchWithDelay<any>(
              `${season}/results`,
              "Race",
              batchSize,
              batchSize,
              offset
            )
          )
        );
        // Process each batch of results
        for (const batchResult of batchResults) {
          if (batchResult?.data?.Races) {
            // Process each race
            for (const race of batchResult.data.Races) {
              if (!race.Results) continue;

              const round = parseInt(race.round);

              // Process each result in this race
              for (const result of race.Results) {
                if (!result.Driver || !result.Constructor) continue;

                // Extract data
                const driverId = result.Driver.driverId;
                const constructorId = result.Constructor.constructorId;
                const position = parseInt(result.position);
                const points = parseFloat(result.points);

                // Process driver statistics
                if (!driverStats[driverId]) {
                  driverStats[driverId] = {
                    id: driverId,
                    name: result.Driver.familyName,
                    code: result.Driver.code,
                    number: result.Driver.permanentNumber,
                    constructor: result.Constructor.name,
                    constructorId: constructorId,
                    Wins: 0,
                    Podiums: 0,
                    PointsFinish: 0,
                    DNF: 0,
                    DSQ: 0,
                    totalPoints: 0,
                    racesCompleted: 0,
                  };
                }

                // Process constructor statistics
                if (!constructorStats[constructorId]) {
                  constructorStats[constructorId] = {
                    id: constructorId,
                    name: result.Constructor.name,
                    Wins: 0,
                    Podiums: 0,
                    PointsFinish: 0,
                    DNF: 0,
                    DSQ: 0,
                    totalPoints: 0,
                    entries: 0,
                  };
                }

                // Update driver statistics
                const driver = driverStats[driverId];
                driver.racesCompleted++;
                if (position === 1) driver.Wins++;
                if (position <= 3) driver.Podiums++;
                if (points > 0) driver.PointsFinish++;
                if (result.status === "Disqualified") driver.DSQ--;
                else if (
                  result.status !== "Finished" &&
                  !result.status.includes("Lap")
                )
                  driver.DNF--;
                driver.totalPoints += points;

                // Update constructor statistics
                const constructor = constructorStats[constructorId];
                constructor.entries++;
                if (position === 1) constructor.Wins++;
                if (position <= 3) constructor.Podiums++;
                if (points > 0) constructor.PointsFinish++;
                if (result.status === "Disqualified") constructor.DSQ--;
                else if (
                  result.status !== "Finished" &&
                  !result.status.includes("Lap")
                )
                  constructor.DNF--;
                constructor.totalPoints += points;

                // Initialize driver if not exists
                if (!driverPointsByRound[driverId]) {
                  driverPointsByRound[driverId] = {
                    name: result.Driver.familyName,
                    constructor: result.Constructor.constructorId,
                    points: Array(totalRaces).fill(0),
                  };
                }
                // Add points for this round
                driverPointsByRound[driverId].points[round - 1] = points;

                // Initialize constructor if not exists
                if (!constructorPointsByRound[constructorId]) {
                  constructorPointsByRound[constructorId] = {
                    name: result.Constructor.name,
                    points: Array(totalRaces).fill(0),
                  };
                }
                // Add points for this round
                constructorPointsByRound[constructorId].points[round - 1] +=
                  points;
              }
            }
          }
        }
      }

      // For including Sprint weekend points
      const sprintRoundsData = await this.raceService.getSprintRounds(season);

      // Process sprint results for sprint rounds
      for (const round of sprintRoundsData.sprintRounds) {
        const sprintResult = await this.raceService.getSprintResults(
          season,
          round
        );

        if (
          (sprintResult?.data as { Races: any[] })?.Races?.[0]?.SprintResults
        ) {
          const data = sprintResult.data as {
            Races: { SprintResults: any[] }[];
          };
          const results = data.Races[0].SprintResults;

          // Process sprint results similar to race results
          for (const result of results) {
            if (!result.Driver || !result.Constructor) continue;

            const driverId = result.Driver.driverId;
            const constructorId = result.Constructor.constructorId;
            const position = parseInt(result.position);
            const points = parseFloat(result.points);

            // Update points in existing stats objects
            if (driverPointsByRound[driverId]) {
              driverPointsByRound[driverId].points[round - 1] += points;
              driverStats[driverId].totalPoints += points;
            }

            if (constructorPointsByRound[constructorId]) {
              constructorPointsByRound[constructorId].points[round - 1] +=
                points;
              constructorStats[constructorId].totalPoints += points;
            }
          }
        }
      }

      // Sort by total points
      const sortByPoints = (a: any, b: any) => b.totalPoints - a.totalPoints;

      // Transform data for stacked bar chart
      const driverRoundData = Object.entries(driverPointsByRound)
        .map(([driverId, data]) => {
          return {
            driver: driverId,
            name: data.name,
            constructor: data.constructor,
            pointsByRound: data.points,
            totalPoints: data.points.reduce(
              (sum: number, points: number) => sum + points,
              0
            ),
          };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints);

      // Transform data for constructor stacked bar chart
      const constructorRoundData = Object.entries(constructorPointsByRound)
        .map(([constructorId, data]) => {
          return {
            constructor: constructorId,
            constructorId: constructorId,
            name: data.name,
            pointsByRound: data.points,
            totalPoints: data.points.reduce(
              (sum: number, points: number) => sum + points,
              0
            ),
          };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints);

      // Format driver data for visualization
      const formattedDriverData = Array.from(
        { length: totalRaces },
        (_, index) => {
          const roundNumber = index + 1;
          const roundPoints: any = {
            name: gpNames[roundNumber] || `R${roundNumber}`, // Use GP abbreviation if available
          };

          driverRoundData.forEach((driver) => {
            roundPoints[driver.driver] = {
              name: driver.name,
              constructor: driver.constructor,
              points: driver.pointsByRound[index],
            };
          });

          return roundPoints;
        }
      );

      // Format constructor data for visualization
      const formattedConstructorData = Array.from(
        { length: totalRaces },
        (_, index) => {
          const roundNumber = index + 1;
          const roundPoints: any = {
            name: gpNames[roundNumber] || `R${roundNumber}`,
          };

          constructorRoundData.forEach((constructor) => {
            roundPoints[constructor.constructor] = {
              name: constructor.name,
              constructor: constructor.constructorId,
              points: constructor.pointsByRound[index],
            };
          });

          return roundPoints;
        }
      );

      return {
        drivers: Object.values(driverStats).sort(sortByPoints),
        constructors: Object.values(constructorStats).sort(sortByPoints),
        driversRound: formattedDriverData,
        constructorRound: formattedConstructorData,
      };
    } catch (e) {
      console.log("Error in getDriverStats: ", e);
    }
  }

  // Driver stats
  async getDriverStats(
    season: string = "current",
    driverId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    interface DriverStats {
      familyName: string;
      constructorId: string;
      seasonAchievements: {
        Wins: number;
        SprintWins: number;
        Podiums: number;
        SprintPodiums: number;
        PointsFinish: number;
        DNF: number;
        DSQ: number;
        TotalRounds?: number;
      };
      pointsThisSeason: number;
      pointsWithoutSprint: number;
      averagePointsPerGP: number;
      totalLapsLed: number;
      finishPositions: {
        distribution: Array<{
          id: string;
          value: number | null | string;
          color: string;
        }>;
        inPoints: Record<string, number>;
      };
      startToFinishFlow: Array<{
        start: number;
        finish: number;
      }>;
      lapsLed: Array<{
        round: number;
        gp: string;
        lapsLed: number;
        lapsNotLed: number;
        color: string;
      }>;
    }

    try {
      const response = await this.apiClient.fetchFromApi(
        `${season}/drivers/${driverId}/results`,
        "Race",
        limit,
        offset
      );

      // const initialResult = await this.raceService.getRaceCalendar();
      // const totalRaces = initialResult.total;

      const constructors = await this.constructorService.getConstructors(
        season
      );
      const totalDrivers = constructors.total * 2;

      const currentRound = response?.total;
      const races = (response?.data as { Races: any[] })?.Races || [];

      // Initialize stats object
      const stats: DriverStats = {
        familyName: "",
        constructorId: "",
        seasonAchievements: {
          Wins: 0,
          SprintWins: 0,
          Podiums: 0,
          SprintPodiums: 0,
          PointsFinish: 0,
          DNF: 0,
          DSQ: 0,
          TotalRounds: 0,
        },
        pointsThisSeason: 0,
        pointsWithoutSprint: 0,
        averagePointsPerGP: 0,
        totalLapsLed: 0,
        finishPositions: {
          distribution: Array.from({ length: totalDrivers }, (_, i) => ({
            id: `P${i + 1}`,
            value: "",
            color: "",
          })),
          inPoints: {
            withPoints: 0,
            withoutPoints: 0,
          },
        },
        startToFinishFlow: [],
        lapsLed: [],
      };

      races.forEach((race: any) => {
        const result = race.Results[0];
        const position = parseInt(result.position);
        const grid = parseInt(result.grid);
        const points = parseFloat(result.points);

        stats.familyName = result.Driver.familyName;
        stats.constructorId = result.Constructor.constructorId;

        // stats.seasonAchievements.TotalRounds = totalRaces;

        // Season Achievements - count wins
        if (position === 1) {
          stats.seasonAchievements.Wins++;
        }
        if (position <= 3) {
          stats.seasonAchievements.Podiums++;
        }
        if (position <= 10) {
          stats.seasonAchievements.PointsFinish++;
        }
        if (result.status === "Retired") {
          stats.seasonAchievements.DNF++;
        }
        if (result.status === "Disqualified") {
          stats.seasonAchievements.DSQ++;
        }

        // Points this Season
        stats.pointsThisSeason += points;
        stats.pointsWithoutSprint += points;

        // Finish Positions Distribution
        const positionIndex = position - 1;
        if (positionIndex >= 0 && positionIndex < totalDrivers) {
          const currentValue =
            stats.finishPositions.distribution[positionIndex].value;
          stats.finishPositions.distribution[positionIndex].value =
            currentValue === "" ? 1 : Number(currentValue) + 1;
          stats.finishPositions.distribution[positionIndex].color =
            getConstructorHex(result.Constructor.constructorId);
        }

        // Finish Positions in Points
        if (points > 0) {
          stats.finishPositions.inPoints.withPoints++;
        } else {
          stats.finishPositions.inPoints.withoutPoints++;
        }

        // Start to Finish Position Flow
        stats.startToFinishFlow.push({
          start: grid,
          finish: position,
        });
      });

      // Adding sprint round details
      const sprintRoundsData = await this.raceService.getSprintRounds(season);

      for (const round of sprintRoundsData.sprintRounds) {
        if (round <= currentRound) {
          const sprintResponse = await this.apiClient.fetchFromApi(
            `${season}/${round}/drivers/${driverId}/sprint`,
            "Race",
            limit,
            offset
          );

          if (
            (sprintResponse?.data as { Races: any[] })?.Races?.[0]
              ?.SprintResults
          ) {
            const data = sprintResponse.data as {
              Races: { SprintResults: any[] }[];
            };
            const results = data.Races[0].SprintResults;

            // Process sprint results similar to race results
            for (const result of results) {
              if (!result.Driver || !result.Constructor) continue;
              const sprintPosition = parseInt(result.position);
              const sprintPoints = parseFloat(result.points);

              // Sprint points
              stats.pointsThisSeason += sprintPoints;

              // Sprint Wins
              if (sprintPosition === 1) {
                stats.seasonAchievements.SprintWins++;
              }

              // Sprint Podiums
              if (sprintPosition <= 3) {
                stats.seasonAchievements.SprintPodiums++;
              }
            }
          }
        }
      }

      // Average points per GP
      stats.averagePointsPerGP = parseFloat(
        (stats.pointsWithoutSprint / races.length).toFixed(1)
      );

      // Get laps led data
      const lapsLedData = await this.getLapsLedByDriver(season, driverId);
      if (lapsLedData) {
        stats.lapsLed = lapsLedData.map((lap) => ({
          ...lap,
          color: getConstructorHex(stats.constructorId),
        }));
      }

      // Total laps led
      stats.totalLapsLed = (lapsLedData ?? []).reduce(
        (total, lap) => total + lap.lapsLed,
        0
      );

      return stats;
    } catch (e) {
      console.log("Error in fetching driver stats: ", e);
    }
  }

  // Get laps led by a driver
  async getLapsLedByDriver(season: string = "current", driverId: string) {
    try {
      const initialResult = await this.raceService.getPreviousRaces(season);
      const gpNames = initialResult.reduce(
        (acc: Record<string, string>, race: any) => {
          const gpName = race.raceName.replace("Grand Prix", "").trim();
          const usedAbbreviations = new Set(Object.values(acc));

          let abbreviation = gpName.includes(" ")
            ? gpName
                .split(" ")
                .map((word: any) => word[0])
                .join("")
            : gpName.slice(0, 3).toUpperCase();

          // If abbreviation already exists, try alternative
          if (usedAbbreviations.has(abbreviation)) {
            // For single word names, use first 2 chars + last char
            if (!gpName.includes(" ")) {
              abbreviation = gpName.slice(0, 2) + gpName.slice(-1);
            } else {
              // For multi-word names, use first char + first char of last word + last char
              const words = gpName.split(" ");
              abbreviation =
                words[0][0] +
                words[words.length - 1][0] +
                words[words.length - 1].slice(-1);
            }
            abbreviation = abbreviation.toUpperCase();
          }

          acc[race.round] = abbreviation;
          return acc;
        },
        {}
      );

      const totalRaces = parseInt(initialResult[0].round);

      const lapsLedPerRound: Array<{
        round: number;
        gp: string;
        locality: string;
        lapsLed: number;
        lapsNotLed: number;
      }> = [];

      for (let roundNum = 1; roundNum <= totalRaces; roundNum++) {
        const roundResponse = await this.apiClient.fetchWithDelay<any>(
          `${season}/${roundNum}/drivers/${driverId}/laps`,
          "Race",
          100,
          100,
          0
        );

        const locality =
          roundResponse?.data?.Races?.[0]?.Circuit?.Location?.locality;

        const laps = roundResponse?.data?.Races?.[0]?.Laps || [];
        let lapsLed = 0;
        let lapsNotLed = 0;

        laps.forEach((lap: any) => {
          const timing = lap.Timings?.[0];
          if (timing?.position === "1") {
            lapsLed++;
          } else {
            lapsNotLed++;
          }
        });

        lapsLedPerRound.push({
          round: roundNum,
          gp: gpNames[roundNum],
          locality: locality,
          lapsLed,
          lapsNotLed,
        });
      }

      return lapsLedPerRound;
    } catch (e) {
      console.log("Error in fetching LapsLed: ", e);
    }
  }
}
