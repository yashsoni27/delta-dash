import { neon } from "@neondatabase/serverless";

export interface IConstructorStaticData {
  constructorId: string;
  constructorName: string;
  nationality: string;
}

export interface IConstructorStandingRoundData {
  season: string;
  round: number;
  constructorId: string;
  position: number;
  points: number;
}

export interface IConstructorEvolutionOutput {
  season: string;
  totalRounds: number;
  constructorsEvolution: Array<{
    constructorId: string;
    name: string;
    nationality: string;
    rounds: Array<{
      round: number;
      position: number;
      points: number;
    }>;
  }>;
}

export class ConstructorRepository {
  private db: ReturnType<typeof neon>;
  private setupPromise: Promise<void>;

  constructor() {
    this.db = neon(process.env.NEXT_PUBLIC_NEON_DATABASE_URL!);
    this.setupPromise = this.setupConstructorEvolutionTables();
  }

  private async setupConstructorEvolutionTables(): Promise<void> {
    try {
      await this.db`
        CREATE TABLE IF NOT EXISTS constructors (
          constructor_id VARCHAR(100) PRIMARY KEY,
          constructor_name VARCHAR(255) NOT NULL,
          nationality VARCHAR(100) NOT NULL,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await this.db`
        CREATE TABLE IF NOT EXISTS constructor_standings_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          season VARCHAR(10) NOT NULL,
          round INTEGER NOT NULL,
          constructor_id VARCHAR(100) NOT NULL,
          position INTEGER NOT NULL,
          points NUMERIC(6, 2) NOT NULL,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          UNIQUE (season, round, constructor_id),
          CONSTRAINT fk_constructor
          FOREIGN KEY (constructor_id)
          REFERENCES constructors (constructor_id)
          ON DELETE CASCADE
        );
      `;
    } catch (error) {
      console.error("Error setting up constructor evolution tables:", error);
      throw error;
    }
  }

  // --- SAVE METHODS ---

  async saveConstructor(constructor: IConstructorStaticData): Promise<void> {
    await this.setupPromise;
    try {
      await this.db`
        INSERT INTO constructors (constructor_id, constructor_name, nationality)
        VALUES (${constructor.constructorId}, ${constructor.constructorName}, ${constructor.nationality})
        ON CONFLICT (constructor_id) DO UPDATE SET
          constructor_name = EXCLUDED.constructor_name,
          nationality = EXCLUDED.nationality,
          last_updated = CURRENT_TIMESTAMP;
      `;
    } catch (error) {
      console.error("Error saving constructor:", error);
      throw error;
    }
  }

  async saveConstructorStandingRound(standing: IConstructorStandingRoundData): Promise<void> {
    await this.setupPromise;
    try {
      await this.db`
        INSERT INTO constructor_standings_history (
          season, round, constructor_id, position, points
        ) VALUES (
          ${standing.season}, ${standing.round}, ${standing.constructorId},
          ${standing.position}, ${standing.points}
        )
        ON CONFLICT (season, round, constructor_id) DO UPDATE SET
          position = EXCLUDED.position,
          points = EXCLUDED.points,
          last_updated = CURRENT_TIMESTAMP;
      `;
    } catch (error) {
      console.error("Error saving constructor standing round:", error);
      throw error;
    }
  }

  // --- FETCH METHODS ---

  async getLastStoredRoundForConstructor(season: string): Promise<number | null> {
    await this.setupPromise;
    try {
      const result: any = await this.db`
        SELECT MAX(round) AS max_round
        FROM constructor_standings_history
        WHERE season = ${season};
      `;
      if (result && result.length > 0 && result[0].max_round !== null) {
        return result[0].max_round;
      }
      return null;
    } catch (error) {
      console.error("Error fetching last stored round for constructor season:", error);
      throw error;
    }
  }

  async getConstructorEvolutionFromDb(
    season: string,
    limit: number,
    offset: number
  ): Promise<IConstructorEvolutionOutput | null> {
    await this.setupPromise;
    try {
      const constructorIdsInSeason: any = await this.db`
        SELECT DISTINCT constructor_id
        FROM constructor_standings_history
        WHERE season = ${season}
        ORDER BY constructor_id
        LIMIT ${limit} OFFSET ${offset};
      `;

      if (constructorIdsInSeason.length === 0) {
        return null;
      }

      const constructorEvolution: IConstructorEvolutionOutput['constructorsEvolution'] = [];
      let totalRoundsInDb = 0;

      for (const { constructor_id } of constructorIdsInSeason) {
        // Fetch constructor static data
        const constructorStatic: any = await this.db`
          SELECT constructor_name, nationality
          FROM constructors
          WHERE constructor_id = ${constructor_id};
        `;

        // Fetch all standings for this constructor for the season
        const standings: any = await this.db`
          SELECT round, position, points
          FROM constructor_standings_history
          WHERE season = ${season} AND constructor_id = ${constructor_id}
          ORDER BY round ASC;
        `;

        if (constructorStatic.length > 0 && standings.length > 0) {
          const constructorData = constructorStatic[0];
          const constructorRounds = standings.map((s: any) => ({
            round: s.round,
            position: s.position,
            points: parseFloat(s.points),
          }));

          const maxRoundForThisConstructor = standings[standings.length - 1]?.round || 0;
          if (maxRoundForThisConstructor > totalRoundsInDb) {
            totalRoundsInDb = maxRoundForThisConstructor;
          }

          constructorEvolution.push({
            constructorId: constructor_id,
            name: constructorData.constructor_name,
            nationality: constructorData.nationality,
            rounds: constructorRounds,
          });
        }
      }

      if (constructorEvolution.length === 0) {
        return null;
      }

      return {
        season: season,
        totalRounds: totalRoundsInDb,
        constructorsEvolution: constructorEvolution,
      };

    } catch (error) {
      console.error("Error fetching constructor evolution from DB:", error);
      throw error;
    }
  }

}
