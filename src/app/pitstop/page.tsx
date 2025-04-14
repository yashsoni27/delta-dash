"use client";
import BarChart from "@/components/ui/BarChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PitStopChart from "@/components/ui/PitStopChart";
import Table from "@/components/ui/Table";
import {
  getAvgPitStopAndEvtId,
  getDriverAvgAndPoints,
  getFastestPitstopAndStanding,
} from "@/lib/api";
import { DHLtoJolpicaConstructor, getConstructorHex } from "@/lib/utils";
import { Column } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [avgPitStop, setAvgPitStop] = useState<any>(null);
  const [columns, setColumns] = useState<any | null>(null);
  const [tableData, setTableData] = useState<any | null>(null);
  const [constStanding, setConstStanding] = useState<any | null>(null);
  const [constAvg, setConstAvg] = useState<any | null>(null);
  const [driverStanding, setDriverStanding] = useState<any | null>(null);
  const [driverAvg, setDriverAvg] = useState<any | null>(null);
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
        key: "country",
        // key: "abbreviation",
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
      const pitStopResponse = await getAvgPitStopAndEvtId();
      const { events, values } = pitStopResponse;
      setAvgPitStop(values);

      const teamAverages = values
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

  useEffect(() => {
    fetchRaces();
    fetchPitStopStanding();
  }, []);

  const fetchPitStopStanding = useCallback(async () => {
    try {
      setIsLoading(true);
      const driverRes = await getDriverAvgAndPoints();
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
      }

      const response = await getFastestPitstopAndStanding();
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
                <Table
                  // className="tracking-tight"
                  heading="Fastest Pit Stops"
                  columns={columns}
                  data={tableData}
                  onRowClick={(item) => console.log(item)}
                />
              </div>

              <div className="grid grid-cols-subgrid lg:col-span-2 2xl:col-span-4 content-start gap-1 sm:gap-4">
                <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10]  sm:rounded-lg p-4 bg-slate-900">
                  <PitStopChart
                    data={avgPitStop}
                    heading="Average Pit Stop Times per GP"
                  />
                </div>
                <div className="2xl:col-start-3 sm:rounded-lg p-4 bg-slate-900">
                  {driverAvg == null ? null : (
                    <BarChart
                      heading="Driver Avg Pit Stop Time"
                      height={400}
                      width={320}
                      data={driverAvg}
                      indexBy="lastName"
                      keys={["avgDuration"]}
                      layout="horizontal"
                      margin={{ top: 30, right: 70, bottom: 20, left: 70 }}
                    />
                  )}
                </div>
                <div className="2xl:col-start-4 sm:rounded-lg p-4 bg-slate-900">
                  {driverStanding == null ? null : (
                    <BarChart
                      heading="Driver DHL Points"
                      height={400}
                      width={320}
                      data={driverStanding}
                      indexBy="lastName"
                      keys={["points"]}
                      layout="horizontal"
                      margin={{ top: 20, right: 70, bottom: 20, left: 70 }}
                    />
                  )}
                </div>
                {/* <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900"></div> */}
                <div className="2xl:col-start-3 sm:rounded-lg p-4 bg-slate-900">
                  {constAvg == null ? null : (
                    <BarChart
                      heading="Constructor Avg Pit Stop Time"
                      height={400}
                      width={320}
                      data={constAvg}
                      indexBy="team"
                      keys={["averageDuration"]}
                      layout="horizontal"
                      margin={{ top: 30, right: 70, bottom: 50, left: 80 }}
                    />
                  )}
                </div>
                <div className="2xl:col-start-4 sm:rounded-lg p-4 bg-slate-900">
                  {constStanding == null ? null : (
                    <BarChart
                      heading="Constructor DHL Points"
                      height={400}
                      width={320}
                      data={constStanding}
                      indexBy="team"
                      keys={["points"]}
                      layout="horizontal"
                      margin={{ top: 30, right: 70, bottom: 50, left: 80 }}
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
