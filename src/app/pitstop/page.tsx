"use client";
import { getAvgPitStopAndEvtId, getPreviousRaces } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [round, setRound] = useState<number | null>(null);
  const [raceName, setRaceName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [raceOptions, setRaceOptions] = useState<
    { name: string; value: number; raceName: string }[]
  >([]);

  // Separate fetch for races data
  const fetchRaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const previousRaces = await getPreviousRaces();
      const options = previousRaces.map((race: any) => ({
        name: race.Circuit.Location.country,
        value: parseInt(race.round, 10),
        raceName: race.raceName,
      }));
      setRaceOptions(options);
      console.log(options);

      if (options.length > 0 && round === null) {
        setRound(options[0].value);
        setRaceName(options[0].raceName);
      }
    } catch (e) {
      console.log("Error fetching races: ", e);
    } finally {
      setIsLoading(false);
    }
  }, [round]);

  useEffect(() => {
    fetchRaces();
  }, [fetchRaces]);

  useEffect(() => {
    const fetchEvtId = async () => {
      const response = await getAvgPitStopAndEvtId();
      // const evtIds = response.events;
      // const avgPitStops = response.values;
      const { events, values } = response;
      console.log("response: ", events, values);
    };
    fetchEvtId();
  }, []);

  const handleRoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRound(Number(e.target.value));
  };

  return (
    <>
      <div className="p-10 pt-0 md:pt-0 gap-4">
        <div className="top-16 z-10 w-full ml-auto sm:pr-0 flex gap-2 justify-between">
          <div className="p-4 text-xl">{raceName}</div>
          <div className="flex gap-2 p-4">
            {/* <div className="flex items-center gap-2">
              <span className="text-xs font-thin">Season:</span>
              <select
                className="inline-flex appearance-none focus:outline-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 px-4 py-2 bg-transparent bg-slate-800"
                value={selectedYear}
                onChange={handleYearChange}
              >
                {Array.from({ length: 3 }, (_, i) => 2025 - i).map((year) => (
                  <option key={year} value={year} className="bg-slate-800">
                    {year}
                  </option>
                ))}
              </select>
            </div> */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-thin">Race:</span>
              <select
                className="inline-flex appearance-none focus:outline-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 w-40 px-4 py-2 bg-transparent bg-slate-800"
                value={round !== null ? round : ""}
                onChange={handleRoundChange}
                disabled={raceOptions.length === 0}
              >
                {raceOptions.length === 0 ? (
                  <option className="bg-slate-800">No races available</option>
                ) : (
                  raceOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-800"
                    >
                      R{option.value}&nbsp;&nbsp;&nbsp;{option.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
