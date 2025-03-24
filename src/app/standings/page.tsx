"use client";
import StandingsTable from "@/components/ui/StandingsTable";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
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
          {title && <StandingsTable name={title} />}
        </div>
      </div>
    </>
  );
}
