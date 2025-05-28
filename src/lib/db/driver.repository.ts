import { neon } from "@neondatabase/serverless";

export interface IDriverStaticData {
  driverId: string;
  driverCode: string;
  driverName: string;
  nationality: string;
}

export interface IDriverStandingRoundData {
  season: string;
  round: number;
  driverId: string;
  position: number;
  points: number;
  constructorId: string;
}

export interface IDriverEvolutionOutput {
  season: string;
  totalRounds: number;
  driversEvolution: Array<{
    driverId: string;
    code: string;
    name: string;
    nationality: string;
    constructorId: string;
    constructors: Array<{
      round: number;
      constructorId: string;
    }>;
    rounds: Array<{
      round: number;
      position: number;
      points: number;
      locality?: string;
    }>;
  }>;
}

export class DriverRepository {
  private db: ReturnType<typeof neon>;
  private setupPromise: Promise<void>;

  constructor() {
    this.db = neon(process.env.NEXT_PUBLIC_NEON_DATABASE_URL!);
    this.setupPromise = this.setupDriverEvolutionTables();
  }

  private async setupDriverEvolutionTables(): Promise<void> {
    try {
      await this.db`
        CREATE TABLE IF NOT EXISTS drivers (
          driver_id VARCHAR(100) PRIMARY KEY,
          driver_code VARCHAR(10),
          driver_name VARCHAR(255) NOT NULL,
          nationality VARCHAR(100) NOT NULL,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await this.db`
      CREATE TABLE IF NOT EXISTS driver_standings_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        season VARCHAR(10) NOT NULL,
        round INTEGER NOT NULL,
        driver_id VARCHAR(100) NOT NULL,
        position INTEGER NOT NULL,
        points NUMERIC(6, 2) NOT NULL, 
        constructor_id VARCHAR(100) NOT NULL, 
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE (season, round, driver_id),
        CONSTRAINT fk_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers (driver_id)
        ON DELETE CASCADE
      );`;
    } catch (error) {
      throw error;
    }
  }

  // --- SAVE METHODS ---

  async saveDriver(driver: IDriverStaticData): Promise<void> {
    await this.setupPromise;
    try {
      await this.db`
        INSERT INTO drivers (driver_id, driver_code, driver_name, nationality)
        VALUES (${driver.driverId}, ${driver.driverCode}, ${driver.driverName}, ${driver.nationality})
        ON CONFLICT (driver_id) DO UPDATE SET
          driver_code = EXCLUDED.driver_code,
          driver_name = EXCLUDED.driver_name,
          nationality = EXCLUDED.nationality,
          last_updated = CURRENT_TIMESTAMP;
      `;
    } catch (error) {
      console.log("Error saving driver: ", error);
      throw error;
    }
  }

  async saveDriverStandingRound(
    standing: IDriverStandingRoundData
  ): Promise<void> {
    await this.setupPromise;
    try {
      await this.db`
        INSERT INTO driver_standings_history (
          season, round, driver_id, position, points, constructor_id
        ) VALUES (
          ${standing.season}, ${standing.round}, ${standing.driverId},
          ${standing.position}, ${standing.points}, ${standing.constructorId}
        )
        ON CONFLICT (season, round, driver_id) DO UPDATE SET
          position = EXCLUDED.position,
          points = EXCLUDED.points,
          constructor_id = EXCLUDED.constructor_id,
          last_updated = CURRENT_TIMESTAMP;
      `;
    } catch (error) {
      console.log("Error saving driver standing round: ", error);
      throw error;
    }
  }

  // --- FETCH METHODS ---

  async getLastStoredRoundForDriver(season: string): Promise<number | null> {
    await this.setupPromise;
    try {
      const result: any = await this.db`
        SELECT MAX(round) AS max_round
        FROM driver_standings_history
        WHERE season = ${season};
      `;
      // Check for first element and then the property 'max_round'
      if (result && result.length > 0 && result[0].max_round !== null) {
        return result[0].max_round;
      }
      return null; // No existing data for this season
    } catch (error) {
      console.error("Error fetching last stored round for season:", error);
      throw error;
    }
  }

  async getDriverEvolutionFromDb(
    season: string,
    limit: number,
    offset: number
  ): Promise<IDriverEvolutionOutput | null> {
    await this.setupPromise;
    try {
      // Fetch all unique drivers for the given season who have standings data
      const driverIdsInSeason: any = await this.db`
        SELECT DISTINCT driver_id
        FROM driver_standings_history
        WHERE season = ${season}
        ORDER BY driver_id
        LIMIT ${limit} OFFSET ${offset};
      `;

      if (driverIdsInSeason.length === 0) {
        return null; // No data for this season/limit/offset
      }

      const driverEvolution: IDriverEvolutionOutput["driversEvolution"] = [];
      let totalRoundsInDb = 0; // To keep track of the max round in DB

      for (const { driver_id } of driverIdsInSeason) {
        // Fetch driver static data
        const driverStatic: any = await this.db`
          SELECT driver_code, driver_name, nationality
          FROM drivers
          WHERE driver_id = ${driver_id};
        `;

        // Fetch all standings for this driver for the season
        const standings: any = await this.db`
          SELECT dsh.round, dsh.position, dsh.points, dsh.constructor_id, r.locality
          FROM driver_standings_history AS dsh
          JOIN races AS r ON dsh.season = r.season AND dsh.round = r.round
          WHERE dsh.season = ${season} AND dsh.driver_id = ${driver_id}
          ORDER BY dsh.round ASC;
        `;

        if (driverStatic.length > 0 && standings.length > 0) {
          const driverData = driverStatic[0];
          const driverRounds = standings.map((s: any) => ({
            round: s.round,
            position: s.position,
            points: parseFloat(s.points),
            locality: s.locality || undefined,
          }));

          const constructorHistory: Array<{
            round: number;
            constructorId: string;
          }> = [];
          let currentConstructor: string | null = null;

          // Build constructor history based on changes
          for (const standing of standings) {
            if (standing.constructor_id !== currentConstructor) {
              constructorHistory.push({
                round: standing.round,
                constructorId: standing.constructor_id,
              });
              currentConstructor = standing.constructor_id;
            }
          }

          const latestConstructorIdFromDB = standings[standings.length - 1]?.constructor_id || null;

          // Update totalRoundsInDb
          const maxRoundForThisDriver =
            standings[standings.length - 1]?.round || 0;
          if (maxRoundForThisDriver > totalRoundsInDb) {
            totalRoundsInDb = maxRoundForThisDriver;
          }

          driverEvolution.push({
            driverId: driver_id,
            code: driverData.driver_code,
            name: driverData.driver_name,
            nationality: driverData.nationality,
            constructorId: latestConstructorIdFromDB,
            constructors: constructorHistory,
            rounds: driverRounds,
          });
        }
      }

      // If no drivers were fetched, return null to signify no data in DB
      if (driverEvolution.length === 0) {
        return null;
      }

      return {
        season: season,
        totalRounds: totalRoundsInDb,
        driversEvolution: driverEvolution,
      };
    } catch (error) {
      console.error("Error fetching driver evolution from DB:", error);
      throw error;
    }
  }
}
