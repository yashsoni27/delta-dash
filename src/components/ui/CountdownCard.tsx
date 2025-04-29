"use client";
import { raceService } from "@/lib/api/index";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import CountdownCardSkeleton from "../loading/CountdownCardSkeleton";

const CountdownCard = () => {
  const [season, setSeason] = useState("");
  const [raceName, setRaceName] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [circuitId, setCircuitId] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [raceFinished, setRaceFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNextRace = async () => {
      setIsLoading(true);
      try {
        const nextRace = await raceService.getNextRace();
        if (nextRace) {
          setSeason(nextRace.season);
          setRaceName(nextRace.raceName);
          setCircuitId(nextRace.Circuit.circuitId);
          let timeStamp = new Date(`${nextRace.date}T${nextRace.time}`);
          setRaceDate(timeStamp.toISOString());
        }
      } catch (e) {
        console.log("Error fetching next race: ", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextRace();
  }, []);

  useEffect(() => {
    if (!raceDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const raceTime = new Date(raceDate).getTime();
      const raceEndTime = raceTime + 2 * 60 * 60 * 1000; // Adding 2 hours

      if (now >= raceTime && now <= raceEndTime) {
        setRaceFinished(true); // Race is finished, but within the 2-hour buffer
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const difference = raceTime - now;

      if (difference <= 0) {
        setRaceFinished(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setRaceFinished(false); // Race has not finished
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [raceDate]);

  if (isLoading) {
    return <CountdownCardSkeleton />;
  }

  return (
    <div className="bg-gradient-to-tr from-red-900 to-red-700 p-5 rounded-lg shadow-lg border border-red-600 max-w-md text-center">
      <h2 className="text-lg text-left">
        {season} {raceName}
      </h2>

      <div className="flex justify-between items-center">
        <div className="flex justify-start align-middle space-x-2 md:space-x-4 text-xl">
          <div className="">
            <p className="font-normal">{timeLeft.days}</p>
            <p className="text-xs font-thin">DAYS</p>
          </div>
          <div>
            <p className="font-normal">{timeLeft.hours}</p>
            <p className="text-xs font-thin">HRS</p>
          </div>
          <div>
            <p className="font-normal">{timeLeft.minutes}</p>
            <p className="text-xs font-thin">MINS</p>
          </div>
          <div>
            <p className="font-normal">{timeLeft.seconds}</p>
            <p className="text-xs font-thin">SEC</p>
          </div>
        </div>
        <Image
          className="md:mr-5 h-20 w-24"
          width={96}
          height={80}
          src={`/circuits/${circuitId}.avif`}
          onError={(e) => (e.currentTarget.src = "/vercel.svg")}
          alt={circuitId + "circuit"}
          priority={true}
        />
      </div>
    </div>
  );
};

export default CountdownCard;
