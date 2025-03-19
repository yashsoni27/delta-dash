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
        const response = await getDriverStandings();

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
        const response = await getConstructorStandings();

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
    // <div className="p-5 rounded-lg shadow-lg w-full max-w-md border border-gray-700 text-gray-300">
    <div className="md:row-start-4 lg:row-start-3 rounded-lg border border-gray-700 pt-2">
      <h2 className="scroll-m-20 text-xl font-semibold tracking-tight p-4">
        {name} Standings
      </h2>
      <div className="aspect-[1/1]">
        <div className="relative w-full overflow-auto">
          <table className="w-full text-left ">
            <thead>
              <tr className="text-sm font-thin text-gray-500">
                <th className="pb-3 text-center w-1/6">Pos.</th>
                <th className="pb-3 text-left w-7/12">{name}</th>
                <th className="pb-3 text-center w-3/12">Points</th>
                {/* <th className="pb-3 text-center w-1/12">Evo.</th> */}
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => (
                <tr
                  key={standing.position}
                  className="text-sm hover:bg-slate-900 delay-75"
                >
                  <td className="py-3 align-middle text-center border-t border-gray-700">
                    {standing.position}
                  </td>
                  <td className="py-3 align-middle text-center border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      {standing.team && (
                        <img
                          src={`/teams/${standing.team}.svg`}
                          alt={standing.team}
                          className="w-5 h-5"
                          onError={(e) => (e.currentTarget.src = "/vercel.svg")}
                        />
                      )}
                      {standing.driver ? standing.driver : standing.constructor}
                    </div>
                  </td>
                  <td className="py-3 align-middle text-center border-t border-gray-700">
                    {standing.points}
                  </td>
                  {/* <td className="py-3 align-middle text-center border-t border-gray-700 text-gray-700">-</td> */}
                </tr>
              ))}
            </tbody>
            {/* <tfoot className="flex justify-center">
          <tr className="text-sm  font-thin">
            <td className="">Full Standings</td>
          </tr>
        </tfoot> */}
          </table>
        </div>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm hover:bg-slate-900 delay-75 h-9 w-full rounded-t-none border-t border-gray-700 p-6">
          Full Standings -&gt;
        </button>
      </div>
    </div>
  );
};

export default StandingsTable;
