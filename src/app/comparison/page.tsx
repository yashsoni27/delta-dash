"use client";
import ComparisonChart from "@/components/ui/ComparisonChart";
import { driverService, f1MediaService, statsService } from "@/lib/api/index";
import {
  getConstructorColor,
  getConstructorGradient,
  getConstructorHex,
} from "@/lib/utils";
import { Users } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface Constructor {
  constructorId: string;
  name: string;
  nationality?: string;
  url?: string;
}

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver1, setSelectedDriver1] = useState<any>(null);
  const [selectedDriver2, setSelectedDriver2] = useState<any>(null);
  const [stats, setStats] = useState<any>();
  const [driver1Img, setDriver1Img] = useState<any>();
  const [driver2Img, setDriver2Img] = useState<any>();

  // const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedYear(Number(e.target.value));
  // };

  // const handleConstructorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedConstructor = constructors.find(
  //     (c: ConstructorStanding) =>
  //       c?.Constructor?.constructorId === e.target.value
  //   );
  //   setSelectedConst(selectedConstructor?.Constructor || null);
  // };

  const fetchDrivers = useCallback(async (year: string) => {
    try {
      setIsLoading(true);
      const response = await driverService.getDriverStandings(year);
      const driverList = response?.standings || [];
      setDrivers(driverList);
      setSelectedDriver1(driverList[0]?.Driver || null);
      setSelectedDriver2(driverList[1]?.Driver || null);
    } catch (e) {
      setDrivers([]);
      setSelectedDriver1(null);
      setSelectedDriver2(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchData = useCallback(
    async (year: string, driverId1: string, driverId2: string) => {
      try {
        setIsLoading(true);
        const response = await statsService.getComparisonData(
          year,
          driverId1,
          driverId2
        );
        setStats(response);
      } catch (e) {
        console.log("Failed in fetching data: ", e);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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

  // Effect to fetch drivers when year changes
  useEffect(() => {
    setDriver1Img(null);
    setDriver2Img(null);
    fetchDrivers(selectedYear.toString());
  }, [selectedYear, fetchDrivers]);

  // Effect to fetch driverData when drivers changes
  useEffect(() => {
    if (selectedDriver1 && selectedDriver2) {
      fetchData(
        selectedYear.toString(),
        selectedDriver1.driverId,
        selectedDriver2.driverId
      );
    }
  }, [selectedDriver1, selectedDriver2, fetchData]);

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
        <div className="flex flex-col justify-between sm:flex-row gap-5 p-4">
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

          {/* Driver 1 Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-thin flex items-center">
              <Users size={16} />
              &nbsp;Driver 1
            </span>
            <select
              className="inline-flex appearance-none focus:outline-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 sm:w-40 px-4 py-2 bg-transparent bg-slate-800"
              value={selectedDriver1?.driverId || ""}
              onChange={(e) => {
                const driver = drivers.find(
                  (d: any) => d.Driver.driverId === e.target.value
                );
                setSelectedDriver1(driver?.Driver || null);
              }}
              disabled={drivers.length === 0}
            >
              {drivers.length === 0 ? (
                <option className="bg-slate-800">No drivers available</option>
              ) : (
                drivers
                  .filter(
                    (option: any) =>
                      option.Driver.driverId !== selectedDriver2?.driverId
                  )
                  .map((option: any) => (
                    <option
                      key={option.Driver.driverId}
                      value={option.Driver.driverId}
                      className="bg-slate-800"
                    >
                      {option.Driver.familyName}
                    </option>
                  ))
              )}
            </select>
          </div>

          {/* Driver 2 Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-thin flex items-center">
              <Users size={16} />
              &nbsp;Driver 2
            </span>
            <select
              className="inline-flex appearance-none focus:outline-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 sm:w-40 px-4 py-2 bg-transparent bg-slate-800"
              value={selectedDriver2?.driverId || ""}
              onChange={(e) => {
                const driver = drivers.find(
                  (d: any) => d.Driver.driverId === e.target.value
                );
                setSelectedDriver2(driver?.Driver || null);
              }}
              disabled={drivers.length === 0}
            >
              {drivers.length === 0 ? (
                <option className="bg-slate-800">No drivers available</option>
              ) : (
                drivers
                  .filter(
                    (option: any) =>
                      option.Driver.driverId !== selectedDriver1?.driverId
                  )
                  .map((option: any) => (
                    <option
                      key={option.Driver.driverId}
                      value={option.Driver.driverId}
                      className="bg-slate-800"
                    >
                      {option.Driver.familyName}
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
                  borderColor: getConstructorColor(
                    stats?.driver1?.constructorId
                  ),
                  boxShadow: `inset 0 0 5px 5px ${getConstructorColor(
                    stats?.driver1?.constructorId
                  )}`,
                }}
              >
                <div className="gap-2 flex flex-col sm:flex-row justify-between items-center">
                  {driver1Img ? (
                    <div
                      className="rounded-lg p-2 mb-4 sm:mb-0"
                      style={{
                        boxShadow: `0 0 20px 20px ${getConstructorColor(
                          stats?.driver1?.constructorId
                        )}`,
                        backgroundColor: `${getConstructorColor(
                          stats?.driver1?.constructorId
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
                      style={{
                        color: getConstructorColor(
                          stats?.driver1?.constructorId
                        ),
                      }}
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
                      style={{
                        color: getConstructorHex(stats?.driver1?.constructorId),
                      }}
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
                      color: getConstructorHex(stats?.driver1?.constructorId),
                      background: `${getConstructorHex(
                        stats?.driver1?.constructorId
                      )}15`,
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
                  background:
                    stats?.driver1?.constructorId ===
                    stats?.driver2?.constructorId
                      ? getConstructorGradient(stats?.driver1?.constructorId)
                      : `linear-gradient(to right, ${getConstructorColor(
                          stats?.driver1?.constructorId
                        )}, ${getConstructorColor(
                          stats?.driver2?.constructorId
                        )})`,
                  borderColor: "transparent",
                }}
              >
                <div className="flex justify-between items-center">
                  <img
                    src={`teams/${stats?.driver1?.constructorId}.svg`}
                    alt={stats?.driver1?.constructorId}
                    className="w-28 h-28 sm:w-36 sm:h-36"
                  />
                  <img
                    src={`versus.svg`}
                    alt="versus img"
                    className="w-16 h-20"
                  />
                  <img
                    src={`teams/${stats?.driver2?.constructorId}.svg`}
                    alt={stats?.driver2?.constructorId}
                    className="w-28 h-28 sm:w-36 sm:h-36"
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
                  borderColor: getConstructorColor(
                    stats?.driver2?.constructorId
                  ),
                  boxShadow: `inset 0 0 5px 5px ${getConstructorColor(
                    stats?.driver2?.constructorId
                  )}`,
                }}
              >
                <div className="gap-2 flex flex-col sm:flex-row-reverse justify-between items-center">
                  {driver2Img ? (
                    <div
                      className="rounded-lg p-2 mb-4 sm:mb-0"
                      style={{
                        boxShadow: `0 0 20px 20px ${getConstructorColor(
                          stats?.driver2?.constructorId
                        )}`,
                        backgroundColor: `${getConstructorColor(
                          stats?.driver2?.constructorId
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
                      style={{
                        color: getConstructorColor(
                          stats?.driver2?.constructorId
                        ),
                      }}
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
                      style={{
                        color: getConstructorHex(stats?.driver2?.constructorId),
                      }}
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
                      color: getConstructorHex(stats?.driver2?.constructorId),
                      background: `${getConstructorHex(
                        stats?.driver2?.constructorId
                      )}15`,
                    }}
                  >
                    {stats?.driver2?.points} pts
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-1 sm:gap-4 mt-5">
              <div className="sm:rounded-lg bg-slate-900 py-4 relative p-4"></div>
              <div className="sm:rounded-lg bg-slate-900 py-4 relative p-4"></div>
              <div className="sm:rounded-lg bg-slate-900 py-4 relative p-4"></div>
              <div className="sm:rounded-lg bg-slate-900 py-4 relative p-4"></div>
            </div> */}
          </>
        )}
      </div>
    </>
  );
}
