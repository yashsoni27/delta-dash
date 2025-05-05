"use client";
import CardSkeleton from "@/components/loading/CardSkeleton";
import ChartSkeleton from "@/components/loading/ChartSkeleton";
import PieChartSkeleton from "@/components/loading/PieChartSkeleton";
import BarChart from "@/components/ui/BarChart";
import Card from "@/components/ui/Card";
import PieChart from "@/components/ui/PieChart";
import RadialBarChart from "@/components/ui/RadialBarChart";
import SankeyChart from "@/components/ui/SankeyChart";
import { driverService, statsService } from "@/lib/api/index";
import { Calendar, CircleSlash2, Flag, Medal, Sigma, User } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [driverStat, setDriverStat] = useState<any>({});

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDriver(e.target.value);
  };

  // Fetch drivers when selectedYear changes
  const loadDrivers = useCallback(async (year: string) => {
    try {
      const response = await driverService.getDriverStandings(year);
      const driversData = response.standings.map((standing: any) => ({
        id: standing.Driver.driverId,
        name: standing.Driver.familyName,
      }));
      setDrivers(driversData);
      setSelectedDriver(driversData.length > 0 ? driversData[0].id : "");
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDriverData = useCallback(
    async (year: string, driverId: string) => {
      try {
        setIsLoading(true);
        const driverData = await statsService.getDriverStats(year.toString(), driverId);
        // console.log("data: ", driverData);
        setDriverStat(driverData);
      } catch (e) {
        console.log("Error in fetching driver data: ", e);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setDrivers([]);
    loadDrivers(selectedYear.toString());
  }, [selectedYear, loadDrivers]);

  useEffect(() => {
    if (selectedDriver && selectedYear) {
      fetchDriverData(selectedYear.toString(), selectedDriver);
    }
  }, [selectedDriver, selectedYear, fetchDriverData]);

  return (
    <>
      <div className="container-fluid px-4">
        <div className="p-4 text-right w-full ml-auto flex gap-2 justify-end">
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

          {/* Driver Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-thin flex items-center">
              <User size={16} />
              &nbsp;Driver
            </span>
            <select
              className="inline-flex overflow-clip appearance-none focus:outline-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs text-center font-thin border border-gray-700 shadow-sm h-9 w-32 px-4 py-2 bg-transparent bg-slate-800"
              value={selectedDriver}
              onChange={handleDriverChange}
              disabled={isLoading || drivers.length === 0}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {drivers.length === 0 ? (
                <option className="bg-slate-800">No data</option>
              ) : (
                drivers.map((driver) => (
                  <option
                    key={driver.id}
                    value={driver.id}
                    className="bg-slate-800 text-ellipsis"
                  >
                    {driver.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-4 sm:pt-0 items-start">
          <div className="grid grid-cols-subgrid md:col-span-2 lg:col-span-4 mb-3 sm:mb-0 gap-4 items-stretch">
            {isLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                <Card
                  title="Wins"
                  subtitle={`${
                    driverStat?.seasonAchievements?.SprintWins === 0
                      ? "No"
                      : driverStat?.seasonAchievements?.SprintWins
                  } Sprint Wins`}
                  stat={driverStat?.seasonAchievements?.Wins}
                  icon={<Medal size={18} />}
                />
                <Card
                  title="Total Points"
                  subtitle="Sprints included"
                  stat={driverStat?.pointsThisSeason}
                  icon={<Sigma size={18} />}
                />
                <Card
                  title="Average points per GP"
                  subtitle="Sprints excluded"
                  stat={driverStat?.averagePointsPerGP}
                  icon={<CircleSlash2 size={18} />}
                />
                <Card
                  title="Laps Led"
                  subtitle="Total laps in P1"
                  stat={driverStat?.totalLapsLed}
                  icon={<Flag size={18} />}
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-subgrid lg:col-span-2 gap-1 sm:gap-4 mb-8">
            <div className="grid grid-cols-subgrid lg:col-span-2 gap-1 sm:gap-4">
              {isLoading ? (
                <>
                  <PieChartSkeleton />
                  <PieChartSkeleton />
                  <ChartSkeleton />
                </>
              ) : (
                <>
                  <div className="sm:rounded-lg bg-slate-900 p-4">
                    <RadialBarChart
                      heading="Season Performance"
                      data={driverStat?.seasonAchievements}
                    />
                  </div>
                  <div className="sm:rounded-lg bg-slate-900 p-4">
                    <PieChart
                      heading="Finish in Points"
                      data={driverStat?.finishPositions?.inPoints}
                      color={driverStat?.constructorId}
                      driver={driverStat?.familyName}
                    />
                  </div>
                  <div className="lg:col-span-2 sm:rounded-lg bg-slate-900 p-4">
                    <SankeyChart
                      heading="Start to Finish Flow"
                      data={driverStat?.startToFinishFlow}
                      driver={driverStat?.familyName}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-subgrid lg:col-span-2 gap-1 sm:gap-4 items-start mb-8">
            {isLoading ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              <>
                <div className="lg:col-span-2 sm:rounded-lg bg-slate-900 p-4">
                  <BarChart
                    heading="Finish Positions Distribution"
                    // height={400}
                    // width={800}
                    data={driverStat?.finishPositions?.distribution}
                    driver={driverStat.familyName}
                    layout="vertical"
                    groupMode="grouped"
                    enableGridY={true}
                    enableTotals={false}
                    enableLabel={true}
                    margin={{ top: 10, right: 0, bottom: 30, left: 10 }}
                    isInteractive={true}
                    showAxisBottom={true}
                  />
                </div>
                <div className="lg:col-span-2 sm:rounded-lg bg-slate-900 p-4">
                  <BarChart
                    heading="Laps Led per Race"
                    // height={400}
                    // width={800}
                    data={driverStat?.lapsLed}
                    driver={driverStat.familyName}
                    keys={["lapsLed"]}
                    indexBy="gp"
                    layout="vertical"
                    groupMode="grouped"
                    enableGridY={true}
                    enableTotals={false}
                    enableLabel={true}
                    margin={{ top: 10, right: 0, bottom: 30, left: 10 }}
                    isInteractive={true}
                    showAxisBottom={true}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
