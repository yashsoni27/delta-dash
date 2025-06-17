"use client";
import Card from "@/components/ui/Card";
import CardSkeleton from "@/components/loading/CardSkeleton";
import CountdownCard from "@/components/ui/CountdownCard";
import StandingsTable from "@/components/ui/StandingsTable";
import { Medal, Timer } from "lucide-react";
import Link from "next/link";

import {
  useFastestLapStandingQuery,
  useLastRaceWinnerQuery,
  useSingleFastestPitStopQuery,
} from "@/hooks/queries/homeQueries";

export default function Home() {
  const fastestPitStopQuery = useSingleFastestPitStopQuery();
  const fastestLapQuery = useFastestLapStandingQuery();
  const lastRaceWinnerQuery = useLastRaceWinnerQuery();

  return (
    <main className="p-2 md:p-10 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:pt-0">
        {/* Card Grid */}
        <CountdownCard />

        {fastestPitStopQuery.isLoading ? (
          <CardSkeleton />
        ) : fastestPitStopQuery.error ? (
          <Card
            title="Fastest Pit Stop"
            icon={<Timer size={18} />}
            stat="Error loading data"
            subtitle="Please try again later"
            className="h-full text-red-500"
          />
        ) : (
          <Link
            href={{
              pathname: "/pitstop",
            }}
          >
            <Card
              title="Fastest Pit Stop"
              icon={<Timer size={18} />}
              stat={`${fastestPitStopQuery.data?.duration} s`}
              subtitle={`${fastestPitStopQuery.data?.lastName} at ${fastestPitStopQuery.data?.abbreviation} (${fastestPitStopQuery.data?.shortTitle})`}
              className="h-full"
            />
          </Link>
        )}
        {fastestLapQuery.isLoading ? (
          <CardSkeleton />
        ) : fastestLapQuery.error ? (
          <Card
            title="Fastest Lap Awards"
            icon={<Timer size={18} />}
            stat="Error loading data"
            subtitle="Please try again later"
            className="h-full text-red-500"
          />
        ) : (
          <Card
            title="Fastest Lap Awards"
            icon={<Timer size={18} />}
            stat={`${fastestLapQuery.data?.flCount} Fastest Laps`}
            subtitle={`${fastestLapQuery.data?.firstName} ${fastestLapQuery.data?.lastName}`}
            className="h-full"
          />
        )}
        {lastRaceWinnerQuery.isLoading ? (
          <CardSkeleton />
        ) : lastRaceWinnerQuery.error ? (
          <Card
            title="Last Race Winner"
            icon={<Medal size={18} />}
            stat="Error loading data"
            subtitle="Please try again later"
            className="h-full text-red-500"
          />
        ) : (
          <Link href={{ pathname: "/races" }}>
            <Card
              title="Last Race Winner"
              icon={<Medal size={18} />}
              stat={lastRaceWinnerQuery.data?.winner || ""}
              subtitle={lastRaceWinnerQuery.data?.raceName || ""}
              className="h-full"
            />
          </Link>
        )}

        {/* Table grid */}
        <StandingsTable name={"Drivers"} />
        <StandingsTable name={"Constructors"} />
      </div>
    </main>
  );
}
