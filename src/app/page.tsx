"use client";
import Card from "@/components/ui/Card";
import CardSkeleton from "@/components/loading/CardSkeleton";
import CountdownCard from "@/components/ui/CountdownCard";
import StandingsTable from "@/components/ui/StandingsTable";
import { getSingleFastestPitStop } from "@/lib/api";
import { Timer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [pitStopInfo, setPitStopInfo] = useState<any | null>(null);

  const fetchFastestPitstop = useCallback(async () => {
    const pitstopRes = await getSingleFastestPitStop();
    console.log(pitstopRes);
    setPitStopInfo(pitstopRes);
  }, []);

  useEffect(() => {
    fetchFastestPitstop();
  }, []);

  return (
    <main className="p-10 md:p-20 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:pt-0">
        {/* Card Grid */}
        <CountdownCard />

        {pitStopInfo == null ? (
          <CardSkeleton />
        ) : (
          <Link
            href={{
              pathname: "/pitstop",
            }}
          >
            <Card
              title="Fastest Pit Stop"
              icon={<Timer size={18} />}
              stat={`${pitStopInfo.duration} s`}
              subtitle={`${pitStopInfo.lastName} at ${pitStopInfo.abbreviation}`}
              className="h-full"
            />
          </Link>
        )}
        <CardSkeleton />
        <CardSkeleton />

        {/* Table grid */}
        <StandingsTable name={"Drivers"} />
        <StandingsTable name={"Constructors"} />
      </div>
    </main>
  );
}
