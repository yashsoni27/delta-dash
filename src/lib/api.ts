import { DHLEndpoint } from "@/app/dhl/[endpoint]/route";

const JOLPICA_API_BASE = "https://api.jolpi.ca/ergast/f1/";

// Interface for API response types
interface ApiResponse<T> {
  data: T;
  status: number;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

function transformResponse<T>(
  mrData: any,
  dataKey: string
): { data: T } & PaginationInfo {
  return {
    data: mrData[`${dataKey}Table`],
    total: parseInt(mrData.total),
    limit: parseInt(mrData.limit),
    offset: parseInt(mrData.offset),
  };
}

// Generic fetch function with error handling
async function fetchFromApi<T>(
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
      // 'Authorization': `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}, ${response.statusText}`);
  }

  const mrData = await response.json();
  return transformResponse<T>(mrData.MRData, dataKey);
}

async function fetchWithDelay<T>(
  url: string,
  dataKey: string,
  delay: number,
  limit: number,
  offset: number
): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return fetchFromApi<T>(url, dataKey, limit, offset);
}

async function fetchFromDHL(endpoint: DHLEndpoint | string): Promise<any> {
  try {
    // const url = endpoint.includes('?') ? 
    const response = await fetch(`dhl/${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next: {revalidate: 3600},
    });

    if (!response.ok) throw new Error(`DHL error: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch DHL data");
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                                API Endpoints                               */
/* -------------------------------------------------------------------------- */

// Season info [Testing]
export async function getSeason(
  season = "current",
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/seasons`,
    "Season",
    limit,
    offset
  );
  // console.log(result);
  return result;
}

// Race calendar
export async function getRaceCalendar(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(`${season}/races`, "Race", limit, offset);
  return result;
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

// Driver info
export async function getDriverInfo(
  season: string = "current",
  driverId: string = "",
  limit: number = 30,
  offset: number = 0
) {
  if (driverId == "") {
    const result = await fetchFromApi(
      `${season}/drivers`,
      "Driver",
      limit,
      offset
    );
    return result;
  } else {
    const result = await fetchFromApi(
      `${season}/drivers/${driverId}`,
      "Driver"
    );
    return result;
  }
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

// Qualifying results
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
  round: string,
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

// Race results
export async function getRaceResults(
  season: string,
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/results`,
    "Race",
    limit,
    offset
  );
  return result;
}

// PitStop info
export async function getPitStopInfo(
  season: string = "current",
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/pitstops`,
    "Race",
    limit,
    offset
  );
  return result;
}

// Get fastest lap info
export async function getFastestLaps(
  season: string = "current",
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  interface LapTiming {
    driverId: string;
    time: number;
    lapNumber: number;
    constructorId: string;
    familyName: string;
    driverCode?: string;
  }

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
      // const roundResponse = await fetchFromApi<any>(
      //   `/${season}/${roundNum}/driverStandings`,
      //   "Standings",
      //   limit,
      //   offset
      // );
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

    console.log(driverEvolution);

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

export async function getFastestPitstop(eventId?: string) {
  try {
    const response = await fetchFromDHL(eventId ? `pitStopByEvent?event=${eventId}` : 'pitStopByEvent');
    console.log("getFastestPitstop response: ", response);

    return response;
  } catch (e) {
    console.log("Error in DHL API: ", e);
  }
}

export async function getAvgPitStopAndEvtId() {
  try {
    const response = await fetchFromDHL('avgPitStopAndEventId');
    // console.log("Event response: ", response);

    return response.chart;
  } catch (e) {
    console.log("Error in DHL API: ", e);
  }
}

export async function getFastestPitstopAndStanding() {
  try {
    const response = await fetchFromDHL('fastestPitStopAndStanding');
    console.log("Standing response: ", response);

    return response;
  } catch (e) {
    console.log("Error in DHL API", e)
  }
}

