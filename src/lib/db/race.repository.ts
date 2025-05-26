import { neon } from "@neondatabase/serverless";

export class RaceRepository {
  private db: ReturnType<typeof neon>;
  private setupPromise: Promise<void>;

  constructor() {
    this.db = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL!);
    this.setupPromise = this.setupDatabase();
  }

  private async setupDatabase(): Promise<void> {
    try {
      await this.db`
      CREATE TABLE IF NOT EXISTS races (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        season VARCHAR(10) NOT NULL,
        round INTEGER NOT NULL,
        race_name VARCHAR(255) NOT NULL,
        circuit_id VARCHAR(100) NOT NULL,
        date VARCHAR(255) NOT NULL,
        time VARCHAR(255) NOT NULL,
        first_practice JSONB,
        second_practice JSONB,
        third_practice JSONB,
        qualifying JSONB,
        sprint JSONB,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(season, round)
    );`;
    } catch (error) {
      throw error;
    }
  }

  async saveRace(race: any) {
    await this.setupPromise;
    try {
      await this.db`
        INSERT INTO races (
          season, 
          round, 
          race_name,
          circuit_id,
          date,
          time,
          first_practice,
          second_practice,
          third_practice,
          qualifying,
          sprint
        ) VALUES (
          ${race.season},
          ${parseInt(race.round)},
          ${race.raceName},
          ${race.Circuit.circuitId},
          ${race.date},
          ${race.time},
          ${JSON.stringify(race.FirstPractice)},
          ${JSON.stringify(race.SecondPractice)},
          ${JSON.stringify(race.ThirdPractice)},
          ${JSON.stringify(race.Qualifying)},
          ${JSON.stringify(race.Sprint)}
        )
        ON CONFLICT (season, round) 
        DO UPDATE SET
          race_name = EXCLUDED.race_name,
          circuit_id = EXCLUDED.circuit_id,
          date = EXCLUDED.date,
          time = EXCLUDED.time,
          first_practice = EXCLUDED.first_practice,
          second_practice = EXCLUDED.second_practice,
          third_practice = EXCLUDED.third_practice,
          qualifying = EXCLUDED.qualifying,
          sprint = EXCLUDED.sprint
        `;
    } catch (error) {
      console.error("Error saving race to DB:", error);
    }
  }

  async getAllRaces(season: number) {
    try {
      const races = await this.db`
        SELECT * FROM races 
        WHERE season = ${season.toString()}
        ORDER BY round ASC
      `;

      // Ensure races is an array before mapping
      const raceArray = Array.isArray(races)
        ? races
        : (races && Array.isArray((races as any).rows))
          ? (races as any).rows
          : [];

      return {
        data: {
          Races: raceArray.map((race: any) => ({
            season: race.season,
            round: race.round,
            raceName: race.race_name,
            Circuit: {
              circuitId: race.circuit_id,
            },
            date: race.date,
            time: race.time,
            FirstPractice: race.first_practice,
            SecondPractice: race.second_practice,
            ThirdPractice: race.third_practice,
            Qualifying: race.qualifying,
            Sprint: race.sprint,
          })),
        },
      };
    } catch (error) {
      console.error("Error fetching races from DB: ", error);
      return null;
    }
  }
}
