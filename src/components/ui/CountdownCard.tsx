"use client"
import { getNextRace } from "@/lib/api";
import React, { useState, useEffect } from "react";

interface CountdownProps {
  raceDate: string; // Example format: "2025-03-15T06:00:00Z"
  raceName: string;
}

const CountdownCard = () => {
  const [season, setSeason] = useState("");
  const [raceName, setRaceName] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchNextRace = async () => {
      try {
        const nextRace = await getNextRace();
        // console.log(nextRace);
        if (nextRace) {
          setSeason(nextRace.season);
          setRaceName(nextRace.raceName);
          let timeStamp = new Date(`${nextRace.date}T${nextRace.time}`);

          setRaceDate(timeStamp.toISOString());
        }
      } catch (e) {
        console.log("Error fetching next race: ", e);
      }
    };

    fetchNextRace();
  }, []);

  useEffect(() => {
    if (!raceDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const raceTime = new Date(raceDate).getTime();
      const difference = raceTime - now;

      if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

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


  return (
    <div className="bg-gradient-to-tr from-red-900 to-red-700 p-5 rounded-lg shadow-lg border border-red-600 w-96 text-center">
      <h2 className="text-2xl font-semibold text-left">{season} {raceName}</h2>
      <div className="flex justify-start space-x-4 text-xl mt-2">
        <div>
          <p className="font-semibold">{timeLeft.days}</p>
          <p className="text-sm font-thin">DAYS</p>
        </div>
        <div>
          <p className="font-semibold">{timeLeft.hours}</p>
          <p className="text-sm font-thin">HRS</p>
        </div>
        <div>
          <p className="font-semibold">{timeLeft.minutes}</p>
          <p className="text-sm font-thin">MINS</p>
        </div>
        <div>
          <p className="font-semibold">{timeLeft.seconds}</p>
          <p className="text-sm font-thin">SEC</p>
        </div>
      </div>
    </div>
  );
}

export default CountdownCard;
