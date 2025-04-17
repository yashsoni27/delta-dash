"use client";
import Card from "@/components/ui/Card";
import CardSkeleton from "@/components/loading/CardSkeleton";
import CountdownCard from "@/components/ui/CountdownCard";
import StandingsTable from "@/components/ui/StandingsTable";
import { getFastestLapStanding, getSingleFastestPitStop, getMeetingId } from "@/lib/api";
import { Timer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [pitStopInfo, setPitStopInfo] = useState<any | null>(null);
  const [fastestLap, setFastestLap] = useState<any | null>(null);

  const fetchFastestPitstop = useCallback(async () => {
    const pitstopRes = await getSingleFastestPitStop();
    setPitStopInfo(pitstopRes);
    const standing = await getFastestLapStanding();
    setFastestLap(standing.standings[0]);

    const Id = await getMeetingId(2);
    console.log(Id);
  }, []);

  useEffect(() => {
    fetchFastestPitstop();
  }, []);

  return (
    <main className="p-10 md:p-10 gap-4">
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
        {fastestLap == null ? (
          <CardSkeleton />
        ) : (
          // <Link
          //   href={{
          //     pathname: "/races",
          //   }}
          // >
            <Card
              title="DHL Fastest Laps"
              icon={<Timer size={18} />}
              stat={`${fastestLap.flCount} Fastest Laps`}
              subtitle={`${fastestLap.firstName} ${fastestLap.lastName}`}
              className="h-full"
            />
          // </Link>
        )}
        <CardSkeleton />

        {/* Table grid */}
        <StandingsTable name={"Drivers"} />
        <StandingsTable name={"Constructors"} />
      </div>
    </main>
  );
}
