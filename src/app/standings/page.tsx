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

  useEffect(() => {
    const fetchEvolution = async () => {
      try {
        if (title == "Drivers") {
          const evolution = await getDriverEvolution();
          setDriverEvolution(evolution);
        } else if (title == "Constructors") {
          const evolution  = await getConstructorEvolution();
          setConstructorEvolution(evolution);
        }
      } catch (e) {
        console.log(`Error fetching ${title} evolution`);
      }
    };

    fetchEvolution();
  }, []);
  return (
    <>
      <div className="p-10 pt-0 md:pt-0 gap-4">
        <div className="top-16 text-right z-10 py-4 w-full ml-auto px-4 sm:pr-0 flex gap-2 justify-end">
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-thin border border-gray-700 shadow-sm h-9 px-4 py-2"
            type="button"
            // data-state="closed"
          >
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-filter opacity-50"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>{" "} */}
            Season: 2025
          </button>
        </div>
        {/* <div>{title} page</div> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5 gap-1 sm:gap-4 sm:mt-0">
          <div className="mb-4 sm:mb-0">
            {title && <StandingsTable name={title} />}
          </div>
          <div className="grid grid-cols-subgrid lg:col-span-2 2xl:col-span-4 content-start gap-1 sm:gap-4">
            {driverEvolution && title && (
              <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                <StandingEvolution title={title} standings={driverEvolution} />
              </div>
            )}
            {constructorEvolution && title && (
              <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                <StandingEvolution title={title} standings={constructorEvolution} />
              </div>
            )}
            {driverEvolution && title && (
              <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                <RankingEvolution title={title} standings={driverEvolution} />
              </div>
            )}
            {constructorEvolution && title && (
              <div className="lg:col-span-2 aspect-[1/1] sm:aspect-[16/10] sm:rounded-lg p-4 bg-slate-900">
                <RankingEvolution title={title} standings={constructorEvolution} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
