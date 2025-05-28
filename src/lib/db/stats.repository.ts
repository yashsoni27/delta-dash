import { neon } from "@neondatabase/serverless";

interface IDriverLapsLed {
  season: string; 
  driverId: string;
  round: number;
  gp: string; 
  locality: string;
  lapsLed: number;
  lapsNotLed: number;
}


export class StatsRepository {
  private db: ReturnType<typeof neon>;
  private setupPromise: Promise<void>;

  constructor() {
    this.db = neon(process.env.NEXT_PUBLIC_NEON_DATABASE_URL!);
    this.setupPromise = this.setupDatabase();
  }

  private async setupDatabase(): Promise<void> {
    try {
      await this.db`
      CREATE TABLE IF NOT EXISTS driver_laps_led (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        season VARCHAR(10) NOT NULL,
        round INTEGER NOT NULL,
        driver_id VARCHAR(100) NOT NULL,

        -- Race Metadata
        locality VARCHAR(100) NOT NULL,
        gp_abbreviation VARCHAR(255) NOT NULL,

        -- Laps Led Data
        laps_led INTEGER NOT NULL,
        laps_not_led INTEGER NOT NULL,

        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(season, round, driver_id)
    );`;
    } catch (error) {
      throw error;
    }
  }

  async saveDriverLapsLed(stat: IDriverLapsLed) {
    await this.setupPromise;
    try {
      await this.db`
        INSERT INTO driver_laps_led (
          season, 
          round, 
          driver_id,
          locality,
          gp_abbreviation,
          laps_led,
          laps_not_led
        ) VALUES (
          ${stat.season},
          ${stat.round},
          ${stat.driverId},
          ${stat.locality},
          ${stat.gp},
          ${stat.lapsLed},
          ${stat.lapsNotLed}
        )
        ON CONFLICT (season, round, driver_id) 
        DO UPDATE SET
          locality = EXCLUDED.locality,
          gp_abbreviation = EXCLUDED.gp_abbreviation,
          laps_led = EXCLUDED.laps_led,
          laps_not_led = EXCLUDED.laps_not_led,
          last_updated = CURRENT_TIMESTAMP;
      `;
    } catch (error) {
      throw error;
    }
  }

  async getLapsLedByDriver(season: string, driverId: string) {
    try {
      const stats = await this.db`
        SELECT 
          season,
          round,
          gp_abbreviation AS gp,
          locality AS locality,
          laps_led AS "lapsLed", 
          laps_not_led AS "lapsNotLed"
        FROM driver_laps_led
        WHERE season = ${season} AND driver_id = ${driverId}
        ORDER BY round ASC;
      `;

      return stats
    } catch (error) {
      throw error;
    }
  }

  async getLastStoredRoundForDriver(season: string, driverId: string): Promise<number | null> {
    await this.setupPromise;
    try {
      const result:any = await this.db`
        SELECT MAX(round) AS last_round
        FROM driver_laps_led
        WHERE season = ${season} AND driver_id = ${driverId};
      `;
      if (result && result.length > 0 && result[0].last_round !== null) {
        return result[0].last_round;
      }
      return null;
    } catch (error) {
      console.error("Error fetching last stored round:", error);
      throw error;
    }
  }
}
