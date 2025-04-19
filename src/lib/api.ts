import { DHLEndpoint } from "@/app/dhl/[endpoint]/route";
import { LapTiming, PaginationInfo } from "@/types";
import {
  circuitIdToF1Adapter,
  fetchWithDelay,
  getConstructorHex,
  transformResponse,
} from "./utils";

const JOLPICA_API_BASE = process.env.NEXT_PUBLIC_JOLPICA_API_BASE;
const F1_MEDIA_BASE = process.env.NEXT_PUBLIC_F1_MEDIA_BASE;
const OPEN_F1_BASE = process.env.NEXT_PUBLIC_OPEN_F1_API_BASE;
const REVALIDATION_TIME = parseInt(process.env.REVALIDATION_TIME || "3600");

export async function fetchFromApi<T>(
  endpoint: string,
  dataKey: string,
  limit: number = 30,
  offset: number = 0
): Promise<{ data: T } & PaginationInfo> {
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  const url = `${JOLPICA_API_BASE}${endpoint}.json?${queryParams}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}, ${response.statusText}`);
  }

  const mrData = await response.json();
  return transformResponse<T>(mrData.MRData, dataKey);
}

export async function fetchFromDHL(
  endpoint: DHLEndpoint | string
): Promise<any> {
  try {
    const response = await fetch(`dhl/${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: REVALIDATION_TIME },
    });

    if (!response.ok) throw new Error(`DHL error: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch DHL data");
    return null;
  }
}

export async function fetchFromOpenF1<T>(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`${OPEN_F1_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`OpenF1 error: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from OpenF1");
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                             Jolpica API Endpoints                          */
/* -------------------------------------------------------------------------- */

// Race calendar
export async function getRaceCalendar(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(`${season}/races`, "Race", limit, offset);
  return result;
}

// Round Details -- unused
export async function getRoundDetails(
  season: string = "current",
  round: number
) {
  const result = await fetchFromApi(`${season}/${round}/races`, "Race");
  return result;
}

// Get Driver details -- unused
export async function getDrivers(season: string = "current") {
  try {
    const response = await fetchFromApi(`${season}/drivers`, "Driver");
    return response;
  } catch (e) {
    console.log("Error in fetching drivers: ", e);
  }
}

// Get rounds having sprint races
export async function getSprintRounds(season: string = "current") {
  try {
    const races = await getRaceCalendar(season);
    const sprintRounds: number[] = [];

    // Check each race for Sprint property
    (races.data as { Races: any[] }).Races.forEach((race: any) => {
      if (race.Sprint) {
        sprintRounds.push(parseInt(race.round));
      }
    });

    return {
      season,
      sprintRounds,
      total: sprintRounds.length,
    };
  } catch (error) {
    console.error("Error fetching sprint rounds:", error);
    return {
      season,
      sprintRounds: [],
      total: 0,
    };
  }
}

// Next Race
export async function getNextRace(season: string = "current") {
  const result = await fetchFromApi<any>(`${season}/races`, "Race");
  const races = result.data?.Races;

  if (!races || races.length === 0) return null;

  const today = new Date();

  const nextRace = races.find((race: any) => {
    const raceDate = new Date(race.date);
    return raceDate >= today;
  });

  return nextRace;
}

// Previous Races
export async function getPreviousRaces(season: string = "current") {
  const result = await fetchFromApi<any>(`${season}/races`, "Race");
  const races = result.data?.Races;

  if (!races || races.length === 0) return [];

  const today = new Date();

  const previousRaces = races
    .filter((race: any) => {
      const raceDate = new Date(race.date);
      return raceDate < today;
    })
    .sort((a: any, b: any) => b.round - a.round);

  return previousRaces;
}

// Constructor info
export async function getConstructors(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/constructors`,
    "Constructor",
    limit,
    offset
  );
  return result;
}

// Get Driver Constructor Pairings
export async function getDriverConstructorPairing(season: string = "current") {
  try {
    // Get Driver constructor pairing, and family Name
    const standingsResponse = await getDriverStandings(season);
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

// Qualifying results - unused
export async function getQualificationResults(
  season: string = "current",
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/qualifying`,
    "Race",
    limit,
    offset
  );
  return result;
}

// Sprint results
export async function getSprintResults(
  season: string = "current",
  round: string | number,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/sprint`,
    "Race",
    limit,
    offset
  );
  return result;
}

// Race results - unused
export async function getRaceResults(
  season: string,
  round: number | string,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/results`,
    "Race",
    limit,
    offset
  );
  const response = Array.isArray((result.data as { Races: any[] })?.Races)
    ? (result.data as { Races: any[] }).Races[0]
    : undefined;
  return response.Results;
}

// Fastest Single Pitstop
export async function getSingleFastestPitStop() {
  try {
    const result = await getFastestPitstopAndStanding();
    const response = result.season_fastest[0];
    return response;
  } catch (e) {
    console.log("Error in fetching DHL API: ", e);
  }
}

// Get fastest lap info
export async function getFastestLaps(
  season: string = "current",
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  // Get Driver constructor pairing, and family Name
  const driverConstructorObject = await getDriverConstructorPairing(season);

  const initialResult = await fetchFromApi(
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
        fetchWithDelay<{ data: any }>(
          `${season}/${round}/laps`,
          "Race",
          index * 100,
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
        // Convert time to seconds
        const [minutes, seconds] = timing.time.split(":");
        const totalSeconds = parseInt(minutes) * 60 + parseFloat(seconds);
        const formattedTime = Number(totalSeconds.toFixed(3));

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

/* -------------------------------------------------------------------------- */
/*                         Driver and Constructor APIs                        */
/* -------------------------------------------------------------------------- */
// Driver standings
export async function getDriverStandings(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  const nextRace = await getNextRace();
  const evoResults = await fetchFromApi<any>(
    `${season}/${nextRace?.round - 2}/driverStandings`,
    "Standings",
    limit,
    offset
  );
  const result = await fetchFromApi<any>(
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

// Constructor standings
export async function getConstructorStandings(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  const nextRace = await getNextRace();

  const evoResults = await fetchFromApi<any>(
    `${season}/${nextRace?.round - 2}/constructorStandings`,
    "Standings",
    limit,
    offset
  );
  const result = await fetchFromApi<any>(
    `${season}/constructorStandings`,
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

// Driver evolution info
export async function getDriverEvolution(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  try {
    const driverMapping: any = {};

    const fullSeasonResponse = await fetchFromApi<any>(
      `${season}/driverStandings`,
      "Standings",
      limit,
      offset
    );
    const fullSeasonData = fullSeasonResponse.data;
    const totalRounds = parseInt(fullSeasonData.StandingsLists[0].round);

    for (let roundNum = 1; roundNum <= totalRounds; roundNum++) {
      const roundResponse = await fetchWithDelay<any>(
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
            rounds: [],
          };
        }

        // Add this round's data
        driverMapping[driverId].rounds.push({
          round: parseInt(currentRound),
          // position: parseInt(standing.position),
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

// Constructor evolution info
export async function getConstructorEvolution(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  try {
    const constructorMapping: any = {};

    const fullSeasonResponse = await fetchFromApi<any>(
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
      const roundResponse = await fetchWithDelay<any>(
        `/${season}/${roundNum}/constructorStandings`,
        "Standings",
        150,
        limit,
        offset
      );
      const roundData = roundResponse.data;
      const standingsList = roundData.StandingsLists[0];
      const currentRound = standingsList.round;
      // console.log(standingsList);

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

// Finishing stats -- for Stats and Pt Distribution
export async function getFinishingStats(season: string = "current") {
  try {
    const driverStats: Record<string, any> = {};
    const constructorStats: Record<string, any> = {};
    const driverPointsByRound: Record<string, any> = {};
    const constructorPointsByRound: Record<string, any> = {};

    const initialResult = await getPreviousRaces();
    const gpNames = initialResult.reduce(
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

    const totalRaces = parseInt(initialResult[0].round);
    const batchSize = 80;
    const requiredRequests = Math.ceil(totalRaces / batchSize);
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
          fetchWithDelay<any>(
            `${season}/results`,
            "Race",
            index * 100,
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
    const sprintRoundsData = await getSprintRounds(season);

    // Process sprint results for sprint rounds
    for (const round of sprintRoundsData.sprintRounds) {
      const sprintResult = await getSprintResults(season, round);

      if ((sprintResult?.data as { Races: any[] })?.Races?.[0]?.SprintResults) {
        const data = sprintResult.data as { Races: { SprintResults: any[] }[] };
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
            constructorPointsByRound[constructorId].points[round - 1] += points;
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
export async function getDriverStats(
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
      Podiums: number;
      PointsFinish: number;
      DNF: number;
      DSQ: number;
      TotalRounds: number;
    };
    pointsThisSeason: number;
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
      color: string;
    }>;
  }

  try {
    const response = await fetchFromApi(
      `${season}/drivers/${driverId}/results`,
      "Race",
      limit,
      offset
    );

    const initialResult = await getRaceCalendar();
    const totalRaces = initialResult.total;

    const constructors = await getConstructors(season);
    const totalDrivers = constructors.total * 2;

    // console.log(response);
    const races = (response?.data as { Races: any[] })?.Races || [];

    // Initialize stats object
    const stats: DriverStats = {
      familyName: "",
      constructorId: "",
      seasonAchievements: {
        Wins: 0,
        Podiums: 0,
        PointsFinish: 0,
        DNF: 0,
        DSQ: 0,
        TotalRounds: 0,
      },
      pointsThisSeason: 0,
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

      stats.seasonAchievements.TotalRounds = totalRaces;

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

    // Average points per GP
    stats.averagePointsPerGP = parseFloat(
      (stats.pointsThisSeason / races.length).toFixed(1)
    );

    // Get laps led data
    const lapsLedData = await getLapsLedByDriver(season, driverId);
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
export async function getLapsLedByDriver(
  season: string = "current",
  driverId: string
) {
  try {
    const initialResult = await getPreviousRaces(season);
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
    }> = [];

    for (let roundNum = 1; roundNum <= totalRaces; roundNum++) {
      const roundResponse = await fetchWithDelay<any>(
        `/${season}/${roundNum}/drivers/${driverId}/laps`,
        "Race",
        100,
        100,
        0
      );

      const locality =
        roundResponse?.data?.Races?.[0]?.Circuit?.Location?.locality;

      const laps = roundResponse?.data?.Races?.[0]?.Laps || [];
      let lapsLed = 0;

      laps.forEach((lap: any) => {
        const timing = lap.Timings?.[0];
        if (timing?.position === "1") {
          lapsLed++;
        }
      });

      lapsLedPerRound.push({
        round: roundNum,
        gp: gpNames[roundNum],
        locality: locality,
        lapsLed,
      });
    }

    return lapsLedPerRound;
  } catch (e) {
    console.log("Error in fetching LapsLed: ", e);
  }
}

/* -------------------------------------------------------------------------- */
/*                                  DHL APIs                                  */
/* -------------------------------------------------------------------------- */
export async function getDriverAvgAndPoints(eventId?: string) {
  try {
    // const response = await fetchFromDHL(
    //   eventId ? `pitStopByEvent?event=${eventId}` : "pitStopByEvent"
    // );
    // const n = response.sort;
    // const Ids = response.event_id;
    // let eventIds = [];
    // for (let i = n; i >= 1; i--) {
    //   eventIds.push(`${Ids - i + 1}`);
    // }
    const roundRes = await getNextRace();
    const round = parseInt(roundRes.round);

    const response = await fetchFromDHL("avgPitStopAndEventId");
    // const n = Object.keys(response.chart.events).length;
    const Id = response.chart.events[0].id;
    let eventIds = [];
    for (let i = Id; i < Id + round; i++) {
      eventIds.push(`${i}`);
    }

    // console.log("response: ", response);

    const allResults = await Promise.all(
      eventIds.map(async (evtId: any) => {
        const response = await fetchFromDHL(`pitStopByEvent?event=${evtId}`);
        return {
          evtId,
          chart: response?.chart ?? [],
        };
      })
    );
    // console.log("all: ", allResults);

    const driverPoints: any = {};
    allResults.forEach((event) => {
      event.chart.forEach((driver: any) => {
        const id = driver.driverNr;
        if (!driverPoints[id]) {
          driverPoints[id] = {
            driverNr: id,
            firstName: driver.firstName,
            lastName: driver.lastName,
            team: driver.team,
            points: 0,
            totalDuration: 0,
            pitStopCount: 0,
            avgDuration: 0,
          };
        }
        driverPoints[id].points += driver.points;
        if (driver.duration && !driver.irregular) {
          driverPoints[id].totalDuration += driver.duration;
          driverPoints[id].pitStopCount++;
        }
      });
    });

    // Calculate average durations
    Object.values(driverPoints).forEach((driver: any) => {
      driver.avgDuration =
        driver.pitStopCount > 0
          ? Number((driver.totalDuration / driver.pitStopCount).toFixed(3))
          : 0;

      delete driver.totalDuration; // Clean up helper properties
      delete driver.pitStopCount;
    });

    const result = Object.values(driverPoints);

    // console.log("res: ", result);

    return result;
  } catch (e) {
    console.log("Error in DHL API: ", e);
  }
}

export async function getAvgPitStopAndEvtId() {
  try {
    const response = await fetchFromDHL("avgPitStopAndEventId");
    const { events, values } = response.chart;

    // Create mapping of event IDs to abbreviations
    const eventMap = events.reduce(
      (acc: Record<string, string>, event: any) => {
        acc[event.id] = event.abbr;
        return acc;
      },
      {}
    );

    // Transform values to use abbreviations instead of event IDs
    const transformedValues = values.map((team: any) => ({
      ...team,
      duration: Object.entries(team.duration).reduce(
        (acc: Record<string, number>, [eventId, duration]) => {
          acc[eventMap[eventId]] = duration as number;
          return acc;
        },
        {}
      ),
    }));

    return { events: events, values: transformedValues };
  } catch (e) {
    console.log("Error in DHL API: ", e);
  }
}

export async function getFastestPitstopAndStanding() {
  try {
    const response = await fetchFromDHL("fastestPitStopAndStanding");
    // console.log("Standing response: ", response.chart);

    return response.chart;
  } catch (e) {
    console.log("Error in DHL API", e);
  }
}

export async function getFastestLapStanding() {
  try {
    const response = await fetchFromDHL("fastestLapStanding");

    return response.chart;
  } catch (e) {
    console.log("Error in DHL API", e);
  }
}

/* -------------------------------------------------------------------------- */
/*                                 OpenF1 APIs                                */
/* -------------------------------------------------------------------------- */
// Get meeting ids
async function getAllMeetingIds(season?: string | number) {
  try {
    if (!season) {
      const year = new Date().getFullYear();
      season = year;
    }
    const meetings = await fetchFromOpenF1(`meetings?year=${season}`);

    // Filter out pre-season testing events and sort by date
    const raceMeetings = meetings
      .filter(
        (meeting: any) =>
          !meeting.meeting_name.toLowerCase().includes("testing")
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
      );

    // Map to simplified format with just the essential info
    const meetingIds = raceMeetings.map((meeting: any, index: number) => ({
      meetingKey: meeting.meeting_key,
      meetingCode: meeting.meeting_code,
      meetingName: meeting.meeting_name,
      circuitName: meeting.circuit_short_name,
      dateStart: meeting.date_start,
      round: index + 1,
    }));

    return {
      season,
      meetings: meetingIds,
    };
  } catch (e) {
    console.log("Error in fetching MeetingIds: ", e);
  }
}

// Get meeting id for round and season
export async function getMeetingId(round: number, season?: string | number) {
  try {
    const meetingIds = await getAllMeetingIds();
    const meeting = meetingIds?.meetings?.filter((m: any) => m.round === round);

    return meeting[0].meetingKey;
  } catch (e) {
    console.log("Error in fetching meeting Id: ", e);
  }
}

/* -------------------------------------------------------------------------- */
/*                              Track Media APIs                              */
/* -------------------------------------------------------------------------- */
export async function getTrackImg(circuitId: string) {
  try {
    const circuit = circuitIdToF1Adapter(circuitId);

    const response = await fetch(`${F1_MEDIA_BASE}${circuit}_Circuit`, {
      next: { revalidate: REVALIDATION_TIME },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch track image: ${response.status}`);
    }

    const imageBlob = await response.blob();
    return URL.createObjectURL(imageBlob);
  } catch (e) {
    console.log("Error in fetching from F1: ", e);
  }
}
