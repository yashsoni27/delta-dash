"use client";
import ChartSkeleton from "@/components/loading/ChartSkeleton";
import BoxPlotChart from "@/components/ui/BoxPlotChart";
import LapTimesChart from "@/components/ui/LapTimesChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StackedBarChart from "@/components/ui/StackedBarChart";
import Table from "@/components/ui/Table";
import TrackImg from "@/components/ui/TrackImg";
import {
  getAvgPitStopAndEvtId,
  getFastestLaps,
  getFastestLapVideo,
  getPreviousRaces,
  getQualificationResults,
  getRaceResults,
} from "@/lib/api";
import { formatTime } from "@/lib/utils";
import { Column } from "@/types";
import { Calendar, CircleAlert, Flag } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [round, setRound] = useState<number | null>(null);
  const [raceName, setRaceName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [raceOptions, setRaceOptions] = useState<
    {
      name: string;
      value: number;
      raceName: string;
      circuitId: string;
      circuitName: string;
    }[]
  >([]);
  const [columns, setColumns] = useState<any | null>(null);
  const [smColumns, setSmColumns] = useState<any | null>(null);
  const [tableData, setTableData] = useState<any | null>(null);
  const [smTableData, setSmTableData] = useState<any | null>(null);
  const [lapData, setLapData] = useState<any | null>(null);
  const [qualificationData, setQualificationData] = useState<any>(null);
  const [vidData, setVidData] = useState<any>(null);

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
    const raceResultColumn: Column[] = [
      { key: "position", header: "#", width: "w-2/8", align: "center" },
      {
        key: "driver",
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
        key: "points",
        header: "Pts",
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
    setSmColumns(column);
    setColumns(raceResultColumn);
  }, []);

  // Fetch for races data
  const fetchRaces = useCallback(
    async (year: string) => {
      try {
        setIsLoading(true);
        const previousRaces = await getPreviousRaces(year);
        const options = previousRaces.map((race: any) => ({
          name: race.Circuit.Location.country,
          value: parseInt(race.round, 10),
          raceName: race.raceName,
          circuitId: race.Circuit.circuitId,
          circuitName: race.Circuit.circuitName,
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
    },
    [round]
  );

  // Separate fetch for race and lap data
  const fetchLapData = useCallback(
    async (year: string, raceRound: string) => {
      try {
        setIsLoading(true);

        // Find the race name from options
        const selectedRace = raceOptions.find(
          (race) => race.value === Number(raceRound)
        );
        if (selectedRace) {
          setRaceName(selectedRace.raceName);
        }

        const pitStopResponse = await getAvgPitStopAndEvtId();
        if (pitStopResponse) {
          const eventId = pitStopResponse?.events[Number(round) - 1]?.id;
          const vid = await getFastestLapVideo(eventId);
          setVidData(vid);
        }

        const response = await getFastestLaps(year, raceRound);
        if (response) {
          const fastest6Laps = response.fastest20Laps
            .map((item, index) => ({
              ...item,
              pos: index + 1,
              time: formatTime(item.time),
            }))
            .slice(0, 6);
          setLapData(response.allLaps);
          setSmTableData(fastest6Laps);
        }

        const resultsResponse = await getRaceResults(year, raceRound);
        if (resultsResponse) {
          const raceResults = resultsResponse.map((item: any, index: any) => ({
            driver: item.Driver.familyName,
            constructorId: item.Constructor.constructorId,
            position: item.position,
            points: item.points,
            time:
              item.status === "Lapped"
                ? "Lapped"
                : item.status === "Retired"
                ? "DNF"
                : item.status === "Disqualified"
                ? "DSQ"
                : item.Time?.time || "",
            pos: index + 1,
          }));
          setTableData(raceResults);
        }

        const qualificationResponse = await getQualificationResults(year, raceRound);
        if (qualificationResponse) {
          setQualificationData(qualificationResponse);
        }
      } catch (e) {
        console.log("Error fetching lap data: ", e);
      } finally {
        setIsLoading(false);
      }
    },
    [raceOptions]
  );

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

  const selectedRace = round
    ? raceOptions.find((race) => race.value === round)
    : null;

  return (
    <>
      <div className="p-10 pt-0 md:pt-0 gap-4">
        <div className="top-16 z-10 w-full ml-auto sm:pr-0 gap-2 flex flex-col-reverse md:flex-row justify-between">
          <div className="p-4 text-xl">{raceName}</div>
          <div className="flex flex-col sm:flex-row gap-5 p-4">
            {/* Season selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-thin flex items-center">
                <Calendar size={16} />
                &nbsp;Season
              </span>
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

            {/* Race Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-thin flex items-center">
                <Flag size={16} />
                &nbsp;Race
              </span>
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
                  heading="Race Result"
                  columns={columns}
                  data={tableData}
                  onRowClick={(item) => console.log(item)}
                />
              </div>

              <div className="grid grid-cols-subgrid lg:col-span-2 2xl:col-span-4 content-start gap-1 sm:gap-4">
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                  <LapTimesChart data={lapData} heading="Lap Times" />
                </div>
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                  <BoxPlotChart data={lapData} heading="Race Pace" />
                </div>
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                  <StackedBarChart
                    heading="Qualification"
                    data={qualificationData?.result}
                    indexBy="driverCode"
                    keys={["Q1", "Q2", "Q3"]}
                    groupMode="grouped"
                    margin={{
                      top: 0,
                      right: 20,
                      bottom: 30,
                      left: 40,
                    }}
                    minValue={qualificationData?.range.min - 0.1}
                    maxValue={qualificationData?.range.max + 0.1}
                    colors={["#d1d1d1", "#1a73e8", "#ffd54f"]}
                  />
                </div>
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                  <Table
                    heading="Top 6 Fastest Laps"
                    columns={smColumns}
                    data={smTableData}
                  />
                </div>
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                  {selectedRace && (
                    <TrackImg
                      circuitId={selectedRace.circuitId}
                      circuitName={selectedRace.circuitName}
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                  {vidData == null ? (
                    <ChartSkeleton />
                  ) : vidData.desktopVideo === "" ? (
                    <>
                      <div className="pb-2 flex flex-row gap-2">
                        <Image
                          src={`dhl-logo.svg`}
                          alt="DHL logo"
                          width={100}
                          height={20}
                          style={{ backgroundColor: "#ffcc01" }}
                        />
                        Fastest Lap Award
                      </div>
                      <div className="h-full flex justify-center items-center text-gray-500">
                        <CircleAlert />
                        &nbsp;&nbsp;Not Available
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="pb-2 flex flex-row gap-2">
                        <Image
                          src={`dhl-logo.svg`}
                          alt="DHL logo"
                          width={100}
                          height={20}
                          style={{ backgroundColor: "#ffcc01" }}
                        />
                        Fastest Lap Award
                      </div>
                      <video
                        className="w-full h-full"
                        controls
                        playsInline
                        poster={vidData?.desktopPoster}
                      >
                        <source src={vidData?.desktopVideo} type="video/mp4" />
                      </video>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
