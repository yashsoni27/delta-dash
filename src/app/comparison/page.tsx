"use client";
import ComparisonChart from "@/components/ui/ComparisonChart";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import {
  constructorService,
  f1MediaService,
  statsService,
} from "@/lib/api/index";
import {
  getConstructorColor,
  getConstructorGradient,
  getConstructorHex,
  lightenColor,
} from "@/lib/utils";
import { Calendar, Users } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface Constructor {
  constructorId: string;
  name: string;
  nationality?: string;
  url?: string;
}

interface ConstructorStanding {
  Constructor: Constructor;
  position: string;
  points: string;
  wins: string;
}

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isLoading, setIsLoading] = useState(true);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [selectedConst, setSelectedConst] = useState<Constructor | null>(null);
  const [stats, setStats] = useState<any>();
  const [driver1Img, setDriver1Img] = useState<any>();
  const [driver2Img, setDriver2Img] = useState<any>();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  const handleConstructorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedConstructor = constructors.find(
      (c: ConstructorStanding) =>
        c?.Constructor?.constructorId === e.target.value
    );
    setSelectedConst(selectedConstructor?.Constructor || null);
  };

  const fetchConstructors = useCallback(async (year: string) => {
    try {
      setIsLoading(true);
      const response = await constructorService.getConstructorStandings(year);
      const constructorsList = response?.standings || [];
      setConstructors(constructorsList);
      setSelectedConst(
        constructorsList.length > 0 ? constructorsList[0].Constructor : null
      );
    } catch (e) {
      setConstructors([]);
      setSelectedConst(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (year: string, constructorId: string) => {
    try {
      setIsLoading(true);
      const response = await statsService.getComparisonData(
        year,
        constructorId
      );
      setStats(response);
    } catch (e) {
      console.log("Failed in fetching data: ", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDriverImage = useCallback(
    async (givenName: string, familyName: string) => {
      try {
        setIsLoading(true);
        const driverCode =
          givenName.substring(0, 3) + familyName.substring(0, 3);
        const logoUrl = await f1MediaService.getDriverNumberLogo(driverCode);
        const headShotUrl = await f1MediaService.getDriverImage(
          givenName,
          familyName
        );
        return { headShot: headShotUrl, logo: logoUrl };
      } catch (e) {
        console.log("Failed in fetching logos:", e);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Effect to fetch constructors when year changes
  useEffect(() => {
    setDriver1Img(null);
    setDriver2Img(null);
    fetchConstructors(selectedYear.toString());
  }, [selectedYear, fetchConstructors]);

  // Effect to fetch driverData when constructors changes
  useEffect(() => {
    if (selectedConst !== null) {
      fetchData(selectedYear.toString(), selectedConst.constructorId);
    }
  }, [selectedConst, fetchData]);

  useEffect(() => {
    const loadDriverLogos = async () => {
      if (stats?.driver1?.driverId && stats?.driver2?.driverId) {
        const [logo1, logo2] = await Promise.all([
          fetchDriverImage(stats.driver1.givenName, stats.driver1.familyName),
          fetchDriverImage(stats.driver2.givenName, stats.driver2.familyName),
        ]);

        setDriver1Img(logo1);
        setDriver2Img(logo2);
      }
    };

    loadDriverLogos();

    return () => {
      if (driver1Img) URL.revokeObjectURL(driver1Img);
      if (driver2Img) URL.revokeObjectURL(driver2Img);
    };
  }, [stats, fetchDriverImage]);

  return (
    <>
      <div className="p-2 md:p-10 md:pt-0 gap-4">
        <div className="flex flex-col justify-end sm:flex-row gap-5 p-4">
          {/* Season selector */}
          {/* <div className="flex items-center gap-2">
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
          </div> */}

          {/* Constructor Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-thin flex items-center">
              <Users size={16} />
              &nbsp;Constructor
            </span>
            <select
              className="inline-flex appearance-none focus:outline-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 sm:w-40 px-4 py-2 bg-transparent bg-slate-800"
              value={selectedConst?.constructorId || ""}
              onChange={handleConstructorChange}
              disabled={constructors?.length === 0}
            >
              {constructors.length === 0 ? (
                <option className="bg-slate-800">No races available</option>
              ) : (
                constructors.map((option: ConstructorStanding) => (
                  <option
                    key={option.Constructor.constructorId}
                    value={option.Constructor.constructorId}
                    className="bg-slate-800"
                  >
                    {option.Constructor.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        {isLoading ? (
          <>
            {/* <LoadingSpinner /> */}
            <div className="animate-pulse">
              <div className="h-32 bg-slate-800 rounded-lg mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-slate-800 rounded-lg" />
                <div className="h-24 bg-slate-800 rounded-lg" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-6 gap-1 sm:gap-4 sm:mt-0">
              {/* Driver 1 details */}
              <div
                className="2xl:col-start-1 lg:col-span-2 sm:rounded-lg p-4 bg-slate-900 flex flex-col border justify-between"
                style={{
                  borderColor: getConstructorColor(stats?.constructorId),
                  boxShadow: `inset 0 0 5px 5px ${getConstructorColor(
                    stats?.constructorId
                  )}`,
                }}
              >
                <div className="gap-2 flex flex-col sm:flex-row justify-between items-center">
                  {driver1Img ? (
                    <div
                      className="rounded-lg p-2 mb-4 sm:mb-0"
                      style={{
                        boxShadow: `0 0 20px 20px ${getConstructorColor(
                          stats?.constructorId
                        )}`,
                        backgroundColor: `${getConstructorColor(
                          stats?.constructorId
                        )}`,
                      }}
                    >
                      <img
                        src={driver1Img?.logo}
                        alt={`${stats?.driver1?.givenName} number logo`}
                        className="w-20 h-20 sm:w-28 sm:h-28"
                      />
                    </div>
                  ) : (
                    <div
                      className="text-6xl sm:text-8xl"
                      style={{ color: stats?.color }}
                    >
                      {stats?.driver1?.driverNo}
                    </div>
                  )}
                  <div className="text-center sm:text-right">
                    <div className="text-lg sm:text-xl font-light text-gray-200 mb-1">
                      {stats?.driver1?.givenName}
                    </div>
                    <div
                      className="text-4xl sm:text-6xl font-bold"
                      style={{ color: stats?.color }}
                    >
                      {stats?.driver1?.familyName}
                    </div>
                  </div>
                </div>

                <img
                  // src={`drivers/${stats?.driver1?.driverId}.avif`}
                  src={driver1Img?.headShot}
                  className="scale-x-[-1] rounded-lg w-full h-auto object-contain"
                  alt={`${stats?.driver1?.givenName} ${stats?.driver1?.familyName}`}
                />

                <div className="flex justify-center items-center gap-2 mt-4">
                  <div
                    className="text-2xl sm:text-4xl font-semibold px-4 py-2 rounded-full"
                    style={{
                      color: stats?.color,
                      background: `${stats?.color}15`,
                    }}
                  >
                    {stats?.driver1?.points} pts
                  </div>
                </div>
              </div>

              {/* Radar Chart */}
              <div
                className="2xl:col-start-3 lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 border"
                style={{
                  background: getConstructorGradient(stats?.constructorId),
                  borderColor: getConstructorColor(stats?.constructorId),
                }}
              >
                <div className="flex justify-center">
                  <img
                    src={`teams/${stats?.constructorId}.svg`}
                    alt={stats?.constructorId}
                    className="w-32 h-32 sm:w-40 sm:h-40"
                  />
                </div>
                <ComparisonChart
                  data={stats}
                  margin={{ top: 30, right: 70, bottom: 30, left: 70 }}
                />
              </div>

              {/* Driver 2 details */}
              <div
                className="2xl:col-start-5 lg:col-span-2 sm:rounded-lg p-4 bg-slate-900 flex flex-col border justify-between"
                style={{
                  borderColor: getConstructorColor(stats?.constructorId),
                  boxShadow: `inset 0 0 5px 5px ${getConstructorColor(
                    stats?.constructorId
                  )}`,
                }}
              >
                <div className="gap-2 flex flex-col sm:flex-row-reverse justify-between items-center">
                  {driver2Img ? (
                    <div
                      className="rounded-lg p-2 mb-4 sm:mb-0"
                      style={{
                        boxShadow: `0 0 20px 20px ${getConstructorColor(
                          stats?.constructorId
                        )}`,
                        backgroundColor: `${getConstructorColor(
                          stats?.constructorId
                        )}`,
                      }}
                    >
                      <img
                        src={driver2Img?.logo}
                        alt={`${stats?.driver2?.givenName} number logo`}
                        className="w-20 h-20 sm:w-28 sm:h-28"
                      />
                    </div>
                  ) : (
                    <div
                      className="text-6xl sm:text-8xl"
                      style={{ color: stats?.color }}
                    >
                      {stats?.driver2?.driverNo}
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <div className="text-lg sm:text-xl font-light text-gray-200 mb-1">
                      {stats?.driver2?.givenName}
                    </div>
                    <div
                      className="text-4xl sm:text-6xl font-bold"
                      style={{ color: stats?.color }}
                    >
                      {stats?.driver2?.familyName}
                    </div>
                  </div>
                </div>

                <img
                  // src={`drivers/${stats?.driver2?.driverId}.avif`}
                  src={driver2Img?.headShot}
                  className="scale-x-[1] rounded-lg w-full h-auto object-contain"
                  alt={`${stats?.driver2?.givenName} ${stats?.driver2?.familyName}`}
                />

                <div className="flex justify-center items-center gap-2 mt-4">
                  <div
                    className="text-2xl sm:text-4xl font-semibold px-4 py-2 rounded-full"
                    style={{
                      color: stats?.color,
                      background: `${stats?.color}15`,
                    }}
                  >
                    {stats?.driver2?.points} pts
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
