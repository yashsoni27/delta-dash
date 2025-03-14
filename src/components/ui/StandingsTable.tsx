"use client";
import { getConstructorStandings, getDriverStandings } from "@/lib/api";
import { useEffect, useState } from "react";

interface Standings {
  position: number;
  driver: string;
  constructor: string;
  points: number;
  evolution?: string;
  team?: string;
}

const StandingsTable = ({ name }: { name: string }) => {
  const [standings, setStandings] = useState<Standings[]>([]);

  useEffect(() => {
    const fetchData = async (name: string) => {
      if (name == "Drivers") {
        const response = await getDriverStandings("2024");

        const formattedDrivers = response.standings
          .slice(0, 10)
          .map((item: any) => ({
            position: Number(item.position),
            driver: item.Driver.familyName,
            points: Number(item.points),
            team: item.Constructors[0]?.constructorId || "Unknown",
          }));

        setStandings(formattedDrivers);
      } else if (name == "Constructors") {
        const response = await getConstructorStandings("2024");
        console.log("Cons: ", response);
        const formattedConstructors = response.standings
          .slice(0, 10)
          .map((item: any) => ({
            position: Number(item.position),
            constructor: item.Constructor.name,
            points: Number(item.points),
            team: item.Constructor?.constructorId || "Unknown",
          }));

        setStandings(formattedConstructors);
      }
    };

    fetchData(name);
  }, []);

  return (
    <div className="p-5 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
      <h2 className="text-lg font-thin mb-3">{name} Standings</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm font-thin text-gray-400">
            <th className="pb-3">Pos.</th>
            <th className="pb-3">{name}</th>
            <th className="pb-3">Points</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => (
            <tr key={standing.position} className="text-sm">
              <td className="py-3 align-middle border-t border-gray-700">
                {standing.position}
              </td>
              <td className="py-3 align-middle border-t border-gray-700 ">
                <div className="flex items-center gap-2">
                  {standing.team && (
                    <img
                      src={`/constructors/${standing.team}.svg`}
                      alt={standing.team}
                      className="w-5 h-5"
                      onError={(e) => (e.currentTarget.src = "/vercel.svg")}
                    />
                  )}
                  {standing.driver ? standing.driver : standing.constructor}
                </div>
              </td>
              <td className="py-3 align-middle border-t border-gray-700 ">
                {standing.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;
