"use client";
import LapTimesChart from "@/components/ui/LapTimesChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Table from "@/components/ui/Table";
import { getFastestLaps, getPreviousRaces } from "@/lib/api";
import { Column } from "@/types";
import { useEffect, useState } from "react";

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [round, setRound] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [raceOptions, setRaceOptions] = useState<
    { name: string; value: number }[]
  >([]);
  const [columns, setColumns] = useState<any | null>(null);
  const [tableData, setTableData] = useState<any | null>(null);
  const [lapData, setLapData] = useState<any | null>(null);

  useEffect(() => {
    const fetchFastestLaps = async () => {
      try {
        setIsLoading(true);
        const previousRaces = await getPreviousRaces(selectedYear.toString());

        // Extract race names and rounds for the select options
        const options = previousRaces.map((race: any) => ({
          name: race.Circuit.Location.country,
          value: parseInt(race.round, 10),
        }));
        setRaceOptions(options);

        if (round == null) {
          setRound(options[0].value);
        }

        // Fetch fastest laps if a round is selected
        if (round !== null) {
          const response = await getFastestLaps(
            selectedYear.toString(),
            round.toString()
          );

          if (response) {
            console.log(response);
            const drivers = response.drivers.map((item, index) => ({
              ...item,
              pos: index + 1,
            }));
            setLapData(response.allLaps);

            // Setting table data
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
                        className="w-5 h-5"
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
            setTableData(drivers);
          }
        }
      } catch (e) {
        console.log("Error fetching drivers: ", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFastestLaps();
  }, [selectedYear, round]);

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
        <div className="top-16 text-right z-10 py-4 w-full ml-auto px-4 sm:pr-0 flex gap-2 justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-thin">Season:</span>
            <select
              className="inline-flex appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 px-4 py-2 bg-transparent bg-slate-800"
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
              className="inline-flex appearance-none items-center overflow-hidden justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 w-32 px-4 py-2 bg-transparent bg-slate-800"
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
                    R{option.value} {option.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5 gap-1 sm:gap-4 sm:mt-0">
              <div className="mb-4 sm:mb-0 min-h-80">
                {/* {tableData && columns && ( */}
                  <Table
                    // className="tracking-tight"
                    heading="Fastest Laps"
                    columns={columns}
                    data={tableData}
                    onRowClick={(item) => console.log(item)}
                  />
                {/* )} */}
              </div>

              <div className="grid grid-cols-subgrid lg:col-span-2 2xl:col-span-4 content-start gap-1 sm:gap-4">
                {/* {tableData && ( */}
                  <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg bg-muted/50 p-4 bg-slate-900">
                    <LapTimesChart data={lapData} />
                  </div>
                {/* )} */}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
