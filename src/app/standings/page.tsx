"use client";
import RankingEvolution from "@/components/ui/RankingEvolution";
import StandingEvolution from "@/components/ui/StandingEvolution";
import StandingsTable from "@/components/ui/StandingsTable";
import { getConstructorEvolution, getDriverEvolution } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const [driverEvolution, setDriverEvolution] = useState<any>();
  const [constructorEvolution, setConstructorEvolution] = useState<any>();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvolution = async () => {
      setIsLoading(true);
      try {
        if (title == "Drivers") {
          const evolution = await getDriverEvolution(selectedYear.toString());
          setDriverEvolution(evolution);
          setConstructorEvolution(undefined);
        } else if (title == "Constructors") {
          const evolution = await getConstructorEvolution(
            selectedYear.toString()
          );
          setConstructorEvolution(evolution);
          setDriverEvolution(undefined);
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
              className="inline-flex appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 px-4 py-2 bg-transparent bg-slate-800"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5 gap-1 sm:gap-4 sm:mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center align-middle text-center">
                <div className="text-sm text-gray-400">Loading data...</div>
              </div>
            ) : (
              <>
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
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
