"use client";
import Card from "@/components/ui/Card";
import CardSkeleton from "@/components/loading/CardSkeleton";
import CountdownCard from "@/components/ui/CountdownCard";
import StandingsTable from "@/components/ui/StandingsTable";
import { Medal, Timer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { dhlService, raceService } from "@/lib/api/index";

export default function Home() {
  const [pitStopInfo, setPitStopInfo] = useState<any | null>(null);
  const [fastestLap, setFastestLap] = useState<any | null>(null);
  const [lastRace, setLastRace] = useState<any | null>(null);
  const [lastWinner, setLastWinner] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    const pitstopRes = await dhlService.getSingleFastestPitStop();
    setPitStopInfo(pitstopRes);
    const standing = await dhlService.getFastestLapStanding();
    setFastestLap(standing.standings[0]);

    const response = await raceService.getPreviousRaces();
    if (response) {
      setLastRace(response[0]?.raceName);
      const lastResult = await raceService.getRaceResults(
        response[0]?.season,
        response[0].round
      );
      setLastWinner(lastResult[0]?.Driver?.familyName);
    }
    // const Id = await getMeetingId(2);
    // console.log(Id);
  }, []);

  useEffect(() => {
    fetchData();
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
              subtitle={`${pitStopInfo.lastName} at ${pitStopInfo.abbreviation} (${pitStopInfo.shortTitle})`}
              className="h-full"
            />
          </Link>
        )}
        {fastestLap == null ? (
          <CardSkeleton />
        ) : (
          <Card
            title="Fastest Lap Awards"
            icon={<Timer size={18} />}
            stat={`${fastestLap.flCount} Fastest Laps`}
            subtitle={`${fastestLap.firstName} ${fastestLap.lastName}`}
            className="h-full"
          />
        )}
        {lastWinner == null || lastRace == null ? (
          <CardSkeleton />
        ) : (
          <Card
            title="Last Race Winner"
            icon={<Medal size={18} />}
            stat={lastWinner}
            subtitle={lastRace}
            className="h-full"
          />
        )}

        {/* Table grid */}
        <StandingsTable name={"Drivers"} />
        <StandingsTable name={"Constructors"} />
      </div>
    </main>
  );
}
