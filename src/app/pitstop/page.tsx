"use client";
import ChartSkeleton from "@/components/loading/ChartSkeleton";
import StandingsTableSkeleton from "@/components/loading/StandingsTableSkeleton";
import BarChart from "@/components/ui/BarChart";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import PitStopChart from "@/components/ui/PitStopChart";
import Table from "@/components/ui/Table";
import { dhlService } from "@/lib/api/index";
import { DHLtoJolpicaConstructor, getConstructorHex } from "@/lib/utils";
import { Column } from "@/types";
import { useCallback, useEffect, useState } from "react";


function formatDriverData(data: any[]) {
  const teamGroups = data.reduce((acc, driver) => {
    if (!acc[driver.team]) {
      acc[driver.team] = {
        team: driver.team,
        color: getConstructorHex(DHLtoJolpicaConstructor(driver.team)),
      };
    }
    acc[driver.team][driver.lastName] = parseFloat(
      driver.avgDuration.toFixed(2)
    );
    acc[driver.team][`${driver.lastName}Color`] = driver.color;
    return acc;
  }, {});

  return Object.values(teamGroups);
}

export default function Home() {
  const [avgPitStop, setAvgPitStop] = useState<any>(null);
  const [columns, setColumns] = useState<any | null>(null);
  const [tableData, setTableData] = useState<any | null>(null);
  const [constStanding, setConstStanding] = useState<any | null>(null);
  const [constAvg, setConstAvg] = useState<any | null>(null);
  const [driverStanding, setDriverStanding] = useState<any | null>(null);
  const [driverAvg, setDriverAvg] = useState<any | null>(null);
  const [pitAvg, setPitAvg] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        // tooltip: (value, item) => `${item.title}`,
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
      const pitStopResponse = await dhlService.getAvgPitStopAndEvtId();
      setAvgPitStop(pitStopResponse?.values);

      const teamAverages = pitStopResponse?.values
        .map((team: any) => ({
          team: team.team_name,
          averageDuration: parseFloat(
            (
              Object.values(team.duration as Record<string, number>).reduce(
                (acc: number, val: number) => acc + val,
                0
              ) / Object.values(team.duration).length
            ).toFixed(2)
          ),
          color: getConstructorHex(DHLtoJolpicaConstructor(team.team_name)),
        }))
        .sort((a: any, b: any) => b.averageDuration - a.averageDuration);
      setConstAvg(teamAverages);
    } catch (e) {
      console.log("Error fetching races: ", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPitStopStanding = useCallback(async () => {
    try {
      setIsLoading(true);
      const driverRes = await dhlService.getDriverAvgAndPoints();
      if (driverRes) {
        const driversWithColors = driverRes.map((item: any) => ({
          ...item,
          color: getConstructorHex(DHLtoJolpicaConstructor(item.team)),
        }));

        const driversByPoints = [...driversWithColors].sort(
          (a: any, b: any) => a.points - b.points
        );
        setDriverStanding(driversByPoints);

        const driversByAvgTime = [...driversWithColors].sort(
          (a: any, b: any) => b.avgDuration - a.avgDuration
        );
        
        setDriverAvg(driversByAvgTime);
        const formattedData = formatDriverData(driversByAvgTime);
        setPitAvg(formattedData);
      }

      const response = await dhlService.getFastestPitstopAndStanding();
      if (response) {
        const pitStops = response.season_fastest.map(
          (item: any, index: any) => ({
            ...item,
            pos: index + 1,
          })
        );
        setTableData(pitStops);

        const standings = response.standings
          .map((item: any, index: any) => ({
            ...item,
            color: getConstructorHex(DHLtoJolpicaConstructor(item.team)),
          }))
          .sort((a: any, b: any) => a.points - b.points);
        setConstStanding(standings);
      }
    } catch (e) {
      console.log("Error fetching PitStop times: ", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRaces();
    fetchPitStopStanding();
  }, [fetchRaces, fetchPitStopStanding]);

  const [chartKeys, setChartKeys] = useState<string[]>([]);

  useEffect(() => {
    if (pitAvg && pitAvg.length > 0) {
      const allDrivers = new Set<string>();

      pitAvg.forEach((team: any) => {
        Object.keys(team).forEach((key) => {
          if (!["team", "color"].includes(key) && !key.endsWith("Color")) {
            allDrivers.add(key);
          }
        });
      });

      // Convert Set to Array
      const driverKeys = Array.from(allDrivers);
      // console.log("All driver keys:", driverKeys);
      setChartKeys(driverKeys);
    }
  }, [pitAvg]);

  return (
    <>
      <div className="p-10 pt-0 md:pt-0 gap-4">
        <div className="top-16 z-10 w-full ml-auto sm:pr-0 flex gap-2 justify-between">
          <div className="p-4 text-xl">{""}</div>
          <div className="flex gap-2 p-4"></div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5 gap-1 sm:gap-4 sm:mt-0">
              <div className="mb-4 sm:mb-0 min-h-80">
                {!tableData ? (
                  <StandingsTableSkeleton />
                ) : (
                  <Table
                    heading="Fastest Pit Stops"
                    className="tracking-tight"
                    columns={columns}
                    data={tableData}
                  />
                )}
              </div>

              <div className="grid grid-cols-subgrid lg:col-span-2 2xl:col-span-4 content-start gap-1 sm:gap-4">
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10]  sm:rounded-lg p-4 bg-slate-900">
                  <BarChart
                    heading="Avg Pit Stop Time By Constructor"
                    data={pitAvg}
                    indexBy="team"
                    // keys={["avgDuration"]}
                    keys={chartKeys}
                    layout="vertical"
                    padding={0.2}
                    margin={{ top: 30, right: 10, bottom: 30, left: 30 }}
                    showAxisLeft={true}
                    showAxisBottom={true}
                    isInteractive={true}
                    pitStopTooltip={true}
                  />
                </div>
                <div className="2xl:col-start-3 sm:rounded-lg p-4 bg-slate-900">
                  {driverAvg == null ? (
                    <ChartSkeleton />
                  ) : (
                    <BarChart
                      heading="Driver Avg Pit Stop Time"
                      height={400}
                      width={320}
                      data={driverAvg}
                      indexBy="lastName"
                      keys={["avgDuration"]}
                      layout="horizontal"
                      margin={{ top: 30, right: 70, bottom: 20, left: 70 }}
                      showAxisLeft={true}
                      isInteractive={true}
                      pitStopTooltip={true}
                    />
                  )}
                </div>
                <div className="2xl:col-start-4 sm:rounded-lg p-4 bg-slate-900">
                  {driverStanding == null ? (
                    <ChartSkeleton />
                  ) : (
                    <BarChart
                      heading="Driver DHL Points"
                      height={400}
                      width={320}
                      data={driverStanding}
                      indexBy="lastName"
                      keys={["points"]}
                      layout="horizontal"
                      margin={{ top: 20, right: 70, bottom: 20, left: 70 }}
                      showAxisLeft={true}
                    />
                  )}
                </div>
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10]  sm:rounded-lg p-4 bg-slate-900">
                  <PitStopChart
                    data={avgPitStop}
                    heading="Average Pit Stop Times per GP"
                  />
                </div>
                <div className="2xl:col-start-3 sm:rounded-lg p-4 bg-slate-900">
                  {constAvg == null ? (
                    <ChartSkeleton />
                  ) : (
                    <BarChart
                      heading="Constructor Avg Pit Stop Time"
                      height={400}
                      width={320}
                      data={constAvg}
                      indexBy="team"
                      keys={["averageDuration"]}
                      layout="horizontal"
                      margin={{ top: 30, right: 70, bottom: 50, left: 80 }}
                      showAxisLeft={true}
                    />
                  )}
                </div>
                <div className="2xl:col-start-4 sm:rounded-lg p-4 bg-slate-900">
                  {constStanding == null ? (
                    <ChartSkeleton />
                  ) : (
                    <BarChart
                      heading="Constructor DHL Points"
                      height={400}
                      width={320}
                      data={constStanding}
                      indexBy="team"
                      keys={["points"]}
                      layout="horizontal"
                      margin={{ top: 30, right: 70, bottom: 50, left: 80 }}
                      showAxisLeft={true}
                    />
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
