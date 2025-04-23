"use client";
import ComparisonChart from "@/components/ui/ComparisonChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getComparisonData,
  getConstructors,
  getConstructorStandings,
} from "@/lib/api";
import { motion } from "framer-motion";
import {
  getConstructorColor,
  getConstructorGradient,
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
      const response = await getConstructorStandings(year);
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
      const response = await getComparisonData(year, constructorId);
      // console.log("stats ", response);
      setStats(response);
    } catch (e) {
      console.log("Failed in fetching data: ", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to constructors races when year changes
  useEffect(() => {
    fetchConstructors(selectedYear.toString());
  }, [selectedYear, fetchConstructors]);

  // Effect to fetch data when constructors changes
  useEffect(() => {
    if (selectedConst !== null) {
      fetchData(selectedYear.toString(), selectedConst.constructorId);
    }
  }, [selectedConst, fetchData]);

  return (
    <>
      <div className="p-10 pt-0 md:pt-0 gap-4">
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

          {/* Race Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-thin flex items-center">
              <Users size={16} />
              &nbsp;Constructor
            </span>
            <select
              className="inline-flex appearance-none focus:outline-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 w-40 px-4 py-2 bg-transparent bg-slate-800"
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
                }}
              >
                <div className="gap-2 flex justify-between items-center">
                  <div className="text-8xl" style={{ color: stats?.color }}>
                    {stats?.driver1?.driverNo}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-light text-gray-200 mb-1">
                      {stats?.driver1?.givenName}
                    </div>
                    <div
                      className="text-6xl font-bold"
                      style={{ color: stats?.color }}
                    >
                      {stats?.driver1?.familyName}
                    </div>
                  </div>
                </div>

                <img
                  src={`drivers/${stats?.driver1?.driverId}.avif`}
                  className="scale-x-[-1] rounded-lg"
                  alt={`${stats?.driver1?.givenName} ${stats?.driver1?.familyName}`}
                />

                <div className="flex justify-center items-center gap-2">
                  <div
                    className="text-4xl font-semibold px-4 py-2 rounded-full"
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
                    className="w-40 h-40"
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
                }}
              >
                <div className="gap-2 flex flex-row-reverse justify-between items-center">
                  <div className="text-8xl" style={{ color: stats?.color }}>
                    {stats?.driver2?.driverNo}
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-light text-gray-200 mb-1">
                      {stats?.driver2?.givenName}
                    </div>
                    <div
                      className="text-6xl font-bold"
                      style={{ color: stats?.color }}
                    >
                      {stats?.driver2?.familyName}
                    </div>
                  </div>
                </div>

                <img
                  src={`drivers/${stats?.driver2?.driverId}.avif`}
                  className="scale-x-[1] rounded-lg"
                  alt={`${stats?.driver2?.givenName} ${stats?.driver2?.familyName}`}
                />

                <div className="flex justify-center items-center gap-2">
                  <div
                    className="text-4xl font-semibold px-4 py-2 rounded-full"
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
