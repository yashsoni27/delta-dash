"use client";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import PtDistributionChart from "@/components/ui/PtDistributionChart";
import RankingEvolution from "@/components/ui/RankingEvolution";
import StackedBarChart from "@/components/ui/StackedBarChart";
import StandingEvolution from "@/components/ui/StandingEvolution";
import StandingsTable from "@/components/ui/StandingsTable";
import {
  constructorService,
  driverService,
  statsService,
} from "@/lib/api/index";
import { Check, Eraser, SquareCheckBig } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function StandingsContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const [driverEvolution, setDriverEvolution] = useState<any>();
  const [constructorEvolution, setConstructorEvolution] = useState<any>();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>();
  const [ptDistribution, setPtDistribution] = useState<any>();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [allOptions, setAllOptions] = useState<any[]>([]);
  // const [availableOptions, setAvailableOptions] = useState<any[]>([]);
  const [showOptionDropdown, setShowOptionDropdown] = useState(false);

  const handleOptionSelection = (optionId: string) => {
    setFilteredData((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const selectAllOptions = () => {
    setFilteredData(allOptions.map((option) => option.id));
  };

  const clearAllOptions = () => {
    setFilteredData([]);
  };

  const getDisplayText = () => {
    if (filteredData.length === 0) return title || "Select";
    return (
      <>
        {title}: <span className="bg-slate-900 px-2 py-1 rounded-xl">{filteredData.length}</span>
      </>
    );
  };

  useEffect(() => {
    const fetchEvolution = async () => {
      setIsLoading(true);
      try {
        const finishingStat = await statsService.getFinishingStats(
          selectedYear.toString()
        );
        if (title === "Drivers") {
          const evolution = await driverService.getDriverEvolution(
            selectedYear.toString()
          );
          setDriverEvolution(evolution);
          setConstructorEvolution(undefined);
          setStats(finishingStat?.drivers);
          setPtDistribution(finishingStat?.driversRound?.slice().reverse());
          const driverOptions =
            finishingStat?.drivers?.map((driver: any) => ({
              id: driver.id,
              name: driver.name,
            })) || [];
          setAllOptions(driverOptions);
          setFilteredData(driverOptions.map((driver: any) => driver.id));
        } else if (title === "Constructors") {
          const evolution = await constructorService.getConstructorEvolution(
            selectedYear.toString()
          );
          setConstructorEvolution(evolution);
          setDriverEvolution(undefined);
          setStats(finishingStat?.constructors);
          setPtDistribution(finishingStat?.constructorRound?.slice().reverse());
          const constructorOptions =
            finishingStat?.constructors?.map((constructor: any) => ({
              id: constructor.id,
              name: constructor.name,
            })) || [];
          setAllOptions(constructorOptions);
          setFilteredData(
            constructorOptions.map((constructor: any) => constructor.id)
          );
        }
      } catch (e) {
        console.log(`Error fetching ${title} evolution`);
      } finally {
        setIsLoading(false);
      }
    };

    if (title) {
      fetchEvolution();
    }
  }, [selectedYear, title]);
  return (
    <>
      <div className="p-2 md:p-10 md:pt-0 gap-4">
        <div className="top-16 text-right z-10 py-4 w-full ml-auto px-4 sm:pr-0 flex gap-2 justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-thin">Season:</span>
            <select
              className="inline-flex appearance-none focus:outline-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 px-4 py-2 bg-transparent bg-slate-800"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {Array.from({ length: 3 }, (_, i) => 2025 - i).map((year) => (
                <option key={year} value={year} className="bg-slate-800">
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-panel relative">
            <button
              className="inline-flex appearance-none focus:outline-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 px-4 py-2 bg-transparent bg-slate-800 hover:bg-slate-700"
              onClick={() => setShowOptionDropdown(!showOptionDropdown)}
            >
              {getDisplayText()}
            </button>

            {showOptionDropdown && (
              <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-gray-800 rounded-md shadow-lg z-50">
                <div className="p-2 border-b border-gray-700">
                  <div className="text-sm font-light  mb-2 text-start">
                    Select {title}
                  </div>
                  <div className="flex justify-between gap-2">
                    <button
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 "
                      onClick={selectAllOptions}
                    >
                      <div className="bg-slate-800 p-2 flex gap-1 rounded-md">
                        <SquareCheckBig size={16} />
                        Select All
                      </div>
                    </button>
                    <button
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                      onClick={clearAllOptions}
                    >
                      <div className="bg-slate-800 p-2 flex gap-1 rounded-md">
                        <Eraser size={16} />
                        Clear
                      </div>
                    </button>
                  </div>
                </div>

                <div className="py-1">
                  {allOptions.map((option) => {
                    const selected = filteredData.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        onClick={() => handleOptionSelection(option.id)}
                        className={`
                          flex items-center py-1 px-2 m-1 cursor-pointer rounded-md hover:bg-slate-800
                          
                        `}
                        style={{ userSelect: "none" }}
                      >
                        <div className="w-5 h-5 mr-3 flex items-center justify-center">
                          {selected && <Check size={16} />}
                        </div>
                        <span className="text-xs text-white">
                          {option.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            {showOptionDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowOptionDropdown(false)}
              />
            )}
          </div>
        </div>

        {title && (
          <>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5 gap-1 sm:gap-4 sm:mt-0">
                  <div className="mb-4 sm:mb-0">
                    <StandingsTable
                      name={title}
                      season={selectedYear.toString()}
                    />
                  </div>
                  <div className="grid grid-cols-subgrid lg:col-span-2 2xl:col-span-4 content-start gap-1 sm:gap-4">
                    {driverEvolution && (
                      <>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <StandingEvolution
                            title={title}
                            standings={
                              driverEvolution
                                ? {
                                    ...driverEvolution,
                                    driversEvolution:
                                      driverEvolution.driversEvolution.filter(
                                        (item: any) =>
                                          filteredData.includes(item.driverId)
                                      ),
                                  }
                                : undefined
                            }
                          />
                        </div>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <RankingEvolution
                            title={title}
                            rankings={
                              driverEvolution
                                ? {
                                    ...driverEvolution,
                                    driversEvolution:
                                      driverEvolution.driversEvolution.filter(
                                        (item: any) =>
                                          filteredData.includes(item.driverId)
                                      ),
                                  }
                                : undefined
                            }
                          />
                        </div>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <StackedBarChart
                            heading="Stats"
                            data={stats?.filter((item: any) =>
                              filteredData.includes(item.id)
                            )}
                            indexBy="code"
                            keys={[
                              "Wins",
                              "Podiums",
                              "PointsFinish",
                              "DNF",
                              "DSQ",
                            ]}
                            groupMode="grouped"
                            margin={{
                              top: 20,
                              right: 20,
                              bottom: 40,
                              left: 30,
                            }}
                          />
                        </div>
                        <div className="lg:col-span-2 sm:rounded-lg p-4 bg-slate-900">
                          <PtDistributionChart
                            heading="Points Distribution"
                            // data={ptDistribution}
                            data={
                              ptDistribution?.map((round: any) => {
                                const filteredRound: any = {
                                  name: round.name,
                                  locality: round.locality,
                                };
                                Object.keys(round).forEach((key) => {
                                  if (["name", "locality"].includes(key))
                                    return;
                                  if (filteredData.includes(key)) {
                                    filteredRound[key] = round[key];
                                  }
                                });
                                return filteredRound;
                              }) || []
                            }
                            indexBy="name"
                            groupMode="stacked"
                            layout="horizontal"
                            margin={{
                              top: 10,
                              right: 10,
                              bottom: 20,
                              left: 40,
                            }}
                            barHeight={18}
                          />
                        </div>
                      </>
                    )}
                    {constructorEvolution && (
                      <>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <StandingEvolution
                            title={title}
                            standings={
                              constructorEvolution
                                ? {
                                    ...constructorEvolution,
                                    constructorsEvolution:
                                      constructorEvolution.constructorsEvolution.filter(
                                        (item: any) =>
                                          filteredData.includes(
                                            item.constructorId
                                          )
                                      ),
                                  }
                                : undefined
                            }
                          />
                        </div>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <RankingEvolution
                            title={title}
                            rankings={
                              constructorEvolution
                                ? {
                                    ...constructorEvolution,
                                    constructorsEvolution:
                                      constructorEvolution.constructorsEvolution.filter(
                                        (item: any) =>
                                          filteredData.includes(
                                            item.constructorId
                                          )
                                      ),
                                  }
                                : undefined
                            }
                          />
                        </div>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <StackedBarChart
                            heading="Stats"
                            data={stats?.filter((item: any) =>
                              filteredData.includes(item.id)
                            )}
                            indexBy="name"
                            keys={[
                              "Wins",
                              "Podiums",
                              "PointsFinish",
                              "DNF",
                              "DSQ",
                            ]}
                            groupMode="grouped"
                            margin={{
                              top: 20,
                              right: 20,
                              bottom: 70,
                              left: 30,
                            }}
                          />
                        </div>
                        <div className="lg:col-span-2 sm:rounded-lg p-4 bg-slate-900">
                          <PtDistributionChart
                            heading="Points Distribution"
                            data={
                              ptDistribution?.map((round: any) => {
                                const filteredRound: any = {
                                  name: round.name,
                                  locality: round.locality,
                                };
                                Object.keys(round).forEach((key) => {
                                  if (["name", "locality"].includes(key))
                                    return;
                                  if (filteredData.includes(key)) {
                                    filteredRound[key] = round[key];
                                  }
                                });
                                return filteredRound;
                              }) || []
                            }
                            indexBy="name"
                            groupMode="stacked"
                            layout="horizontal"
                            margin={{
                              top: 10,
                              right: 10,
                              bottom: 20,
                              left: 40,
                            }}
                            barHeight={18}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StandingsContent />
    </Suspense>
  );
}
