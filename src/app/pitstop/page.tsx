"use client";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PitStopChart from "@/components/ui/PitStopChart";
import Table from "@/components/ui/Table";
import {
  getAvgPitStopAndEvtId,
  getFastestPitstopAndStanding,
  getPreviousRaces,
} from "@/lib/api";
import { DHLtoJolpicaConstructor } from "@/lib/utils";
import { Column } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [round, setRound] = useState<number | null>(null);
  // const [raceName, setRaceName] = useState<string>("");
  const [race, setRace] = useState<any | null>(null);
  const [avgPitStop, setAvgPitStop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [raceOptions, setRaceOptions] = useState<
    { name: string; value: number; raceName: string }[]
  >([]);
  const [columns, setColumns] = useState<any | null>(null);
  const [tableData, setTableData] = useState<any | null>(null);

  useEffect(() => {
    const column: Column[] = [
      { key: "pos", header: "#", width: "w-2/8", align: "center" },
      {
        key: "lastName",
        header: "Driver",
        width: "w-3/8",
        align: "left",
        render: (value, item) => (
          <div className="flex item-center gap-2">
            {item.team && (
              <img
                src={`/teams/${DHLtoJolpicaConstructor(item.team)}.svg`}
                alt={item.team}
                className="w-6 h-6"
                onError={(e) => (e.currentTarget.src = "/vercel.svg")}
              />
            )}
            {value || item.team}
          </div>
        ),
      },
      {
        // key: "country",
        key: "abbreviation",
        header: "GP",
        width: "w-1/8",
        align: "right",
        tooltip: (value, item) => `${item.title}`
      },
      {
        key: "duration",
        header: "Time (sec)",
        width: "w-2/8",
        align: "center",
      },
    ];
    setColumns(column);
  }, []);

  const fetchRaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const previousRaces = await getPreviousRaces();
      const pitStopResponse = await getAvgPitStopAndEvtId();
      const { events, values } = pitStopResponse;
      // console.log("response: ", events, values);
      setAvgPitStop(values);
      const options = previousRaces.map((race: any) => ({
        name: race.Circuit.Location.country,
        value: parseInt(race.round, 10),
        raceName: race.raceName,
        eventId: events[parseInt(race.round, 10) - 1]?.id || 0, // for DHL API
      }));
      setRaceOptions(options);
      // console.log("options with evtId: ", options);

      if (options.length > 0 && round === null) {
        setRound(options[0].value);
        // setRaceName(options[0].raceName);
        setRace(options[0]);
      }
    } catch (e) {
      console.log("Error fetching races: ", e);
    } finally {
      setIsLoading(false);
    }
  }, [round]);

  useEffect(() => {
    fetchRaces();
    fetchPitStopStanding();
  }, [fetchRaces]);

  
  const fetchPitStopStanding = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await getFastestPitstopAndStanding();
      if (response) {
        console.log("response: ", response);
        const pitStops = response.season_fastest.map((item: any, index: any) => ({
          ...item,
          pos: index + 1,
        }));
        setTableData(pitStops);
      }
    } catch (e) {
      console.log("Error fetching PitStop times: ", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRound(Number(e.target.value));
  };

  return (
    <>
      <div className="p-10 pt-0 md:pt-0 gap-4">
        <div className="top-16 z-10 w-full ml-auto sm:pr-0 flex gap-2 justify-between">
          <div className="p-4 text-xl">{race == null ? "" : race.raceName}</div>
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

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5 gap-1 sm:gap-4 sm:mt-0">
              <div className="mb-4 sm:mb-0 min-h-80">
                <Table
                  // className="tracking-tight"
                  heading="Fastest Pitstops"
                  columns={columns}
                  data={tableData}
                  onRowClick={(item) => console.log(item)}
                />
              </div>

              <div className="grid grid-cols-subgrid lg:col-span-2 2xl:col-span-4 content-start gap-1 sm:gap-4">
                <div className="lg:col-span-2 lg:col-start-2 sm:rounded-lg bg-muted/50 p-4"></div>
                <div className="2xl:col-start-4 sm:rounded-lg bg-muted/50 p-4"></div>
                <div className="2xl:col-start-5 sm:rounded-lg bg-muted/50 p-4"></div>
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg bg-muted/50 p-4 bg-slate-900">
                  <PitStopChart data={avgPitStop} heading="Pit Stop Times" />
                </div>
                <div className="2xl:col-start-4 aspect-[5/3] sm:aspect-[4/3] sm:rounded-lg bg-muted/50 p-4"></div>
                <div className="2xl:col-start-5 aspect-[5/3] sm:aspect-[4/3] sm:rounded-lg bg-muted/50 p-4"></div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
