"use client";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PtDistributionChart from "@/components/ui/PtDistributionChart";
import RankingEvolution from "@/components/ui/RankingEvolution";
import StackedBarChart from "@/components/ui/StackedBarChart";
import StandingEvolution from "@/components/ui/StandingEvolution";
import StandingsTable from "@/components/ui/StandingsTable";
import {
  getConstructorEvolution,
  getDriverEvolution,
  getFinishingStats,
} from "@/lib/api";
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

  useEffect(() => {
    const fetchEvolution = async () => {
      setIsLoading(true);
      try {
        const finishingStat = await getFinishingStats(selectedYear.toString());
        if (title === "Drivers") {
          const evolution = await getDriverEvolution(selectedYear.toString());
          setDriverEvolution(evolution);
          setConstructorEvolution(undefined);
          setStats(finishingStat?.drivers);
          setPtDistribution(finishingStat?.driversRound?.slice().reverse());
        } else if (title === "Constructors") {
          const evolution = await getConstructorEvolution(
            selectedYear.toString()
          );
          setConstructorEvolution(evolution);
          setDriverEvolution(undefined);
          setStats(finishingStat?.constructors);
          setPtDistribution(finishingStat?.constructorRound?.slice().reverse());
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
      <div className="p-10 pt-0 md:pt-0 gap-4">
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
                            standings={driverEvolution}
                          />
                        </div>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <RankingEvolution
                            title={title}
                            rankings={driverEvolution}
                          />
                        </div>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <StackedBarChart
                            heading="Stats"
                            data={stats}
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
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <PtDistributionChart
                            heading="Points Distribution"                        
                            data={ptDistribution}
                            indexBy="name"
                            groupMode="stacked"
                            layout="horizontal"
                            margin={{
                              top: 20,
                              right: 30,
                              bottom: 40,
                              left: 40,
                            }}
                          />
                        </div>
                      </>
                    )}
                    {constructorEvolution && (
                      <>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <StandingEvolution
                            title={title}
                            standings={constructorEvolution}
                          />
                        </div>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <RankingEvolution
                            title={title}
                            rankings={constructorEvolution}
                          />
                        </div>
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <StackedBarChart
                            heading="Stats"
                            data={stats}
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
                        <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                          <PtDistributionChart
                            heading="Points Distribution"                        
                            data={ptDistribution}
                            indexBy="name"
                            groupMode="stacked"
                            layout="horizontal"
                            margin={{
                              top: 20,
                              right: 30,
                              bottom: 40,
                              left: 40,
                            }}
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
