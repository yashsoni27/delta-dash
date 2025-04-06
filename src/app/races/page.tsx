"use client";
import BoxPlotChart from "@/components/ui/BoxPlotChart";
import LapTimesChart from "@/components/ui/LapTimesChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Table from "@/components/ui/Table";
import { getFastestLaps, getFastestPitstop, getPreviousRaces } from "@/lib/api";
import { Column } from "@/types";
import { useCallback, useEffect, useState } from "react";

// export async function getServerSideProps() {
//   const data = await getDHLInfo();
//   return {
//     props: {data}
//   }
// }

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [round, setRound] = useState<number | null>(null);
  const [raceName, setRaceName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [raceOptions, setRaceOptions] = useState<
    { name: string; value: number; raceName: string }[]
  >([]);
  const [columns, setColumns] = useState<any | null>(null);
  const [tableData, setTableData] = useState<any | null>(null);
  const [lapData, setLapData] = useState<any | null>(null);

  useEffect(() => {
    const column: Column[] = [
      { key: "pos", header: "#", width: "w-2/8", align: "center" },
      {
        key: "familyName",
        header: "Driver",
        width: "w-3/8",
        align: "left",
        render: (value, item) => (
          <div className="flex item-center gap-2">
            {item.constructorId && (
              <img
                src={`/teams/${item.constructorId}.svg`}
                alt={item.constructorId}
                className="w-6 h-6"
                onError={(e) => (e.currentTarget.src = "/vercel.svg")}
              />
            )}
            {value || item.constructorId}
          </div>
        ),
      },
      {
        key: "lapNumber",
        header: "Lap",
        width: "w-1/8",
        align: "right",
      },
      {
        key: "time",
        header: "Time (sec)",
        width: "w-2/8",
        align: "center",
      },
    ];
    setColumns(column);
  }, []);

  // Separate fetch for races data
  const fetchRaces = useCallback(async (year: string) => {
    try {
      setIsLoading(true);
      const previousRaces = await getPreviousRaces(year);
      const options = previousRaces.map((race: any) => ({
        name: race.Circuit.Location.country,
        value: parseInt(race.round, 10),
        raceName: race.raceName,
      }));
      setRaceOptions(options);
      
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

  // Separate fetch for lap data
  const fetchLapData = useCallback(async (year: string, raceRound: string) => {
    try {
      setIsLoading(true);
      
      // Find the race name from options
      const selectedRace = raceOptions.find(race => race.value === Number(raceRound));
      if (selectedRace) {
        setRaceName(selectedRace.raceName);
      }
      
      const response = await getFastestLaps(year, raceRound);

      if (response) {
        // console.log(response);
        // const drivers = response.drivers.map((item, index) => ({
        const drivers = response.fastest20Laps.map((item, index) => ({
          ...item,
          pos: index + 1,
        }));
        setLapData(response.allLaps);
        setTableData(drivers);
      }
    } catch (e) {
      console.log("Error fetching lap data: ", e);
    } finally {
      setIsLoading(false);
    }
  }, [raceOptions]);


  // Effect to fetch races when year changes
  useEffect(() => {
    fetchRaces(selectedYear.toString());
  }, [selectedYear, fetchRaces]);

  // Effect to fetch lap data when round changes
  useEffect(() => {
    if (round !== null) {
      fetchLapData(selectedYear.toString(), round.toString());
    }
  }, [selectedYear, round, fetchLapData]);


  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
    setRound(null); // Reset round when year changes
    setRaceOptions([]); // Clear race options
  };

  const handleRoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTableData(null);
    setLapData(null);
    setRound(Number(e.target.value));
  };

  return (
    <>
      <div className="p-10 pt-0 md:pt-0 gap-4">
        <div className="top-16 z-10 w-full ml-auto sm:pr-0 flex gap-2 justify-between">
          <div className="p-4 text-xl">{raceName}</div>
          <div className="flex gap-2 p-4">
            <div className="flex items-center gap-2">
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
            </div>
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
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5 gap-1 sm:gap-4 sm:mt-0">
              <div className="mb-4 sm:mb-0 min-h-80">
                <Table
                  // className="tracking-tight"
                  heading="Fastest Laps"
                  columns={columns}
                  data={tableData}
                  onRowClick={(item) => console.log(item)}
                />
              </div>

              <div className="grid grid-cols-subgrid lg:col-span-2 2xl:col-span-4 content-start gap-1 sm:gap-4">
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg bg-muted/50 p-4 bg-slate-900">
                  <LapTimesChart data={lapData} heading="Lap Times" />
                </div>
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg bg-muted/50 p-4 bg-slate-900">
                  <BoxPlotChart data={lapData} heading="Race Pace" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
