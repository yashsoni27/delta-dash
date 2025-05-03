"use client";
import { raceService } from "@/lib/api/index";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import CountdownCardSkeleton from "../loading/CountdownCardSkeleton";
import Link from "next/link";

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
  const [sessionOngoing, setSessionOngoing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionName, setSessionName] = useState<string>("");

  const getSessionName = (sessionType: string): string => {
    const displayName: { [key: string]: string } = {
      FirstPractice: "Practice 1",
      SecondPractice: "Practice 2",
      ThirdPractice: "Practice 3",
      SprintQualifying: "Sprint Qualifying",
      Sprint: "Sprint",
      race: "Race",
    };

    return displayName[sessionType] || sessionType;
  };

  useEffect(() => {
    const fetchNextRace = async () => {
      setIsLoading(true);
      try {
        const nextRace = await raceService.getNextRace();
        if (nextRace) {
          setSeason(nextRace.season);
          setRaceName(nextRace.raceName);
          setCircuitId(nextRace.Circuit.circuitId);

          const now = new Date().getTime();
          const sessions = [
            { type: "FirstPractice", ...nextRace.FirstPractice },
            { type: "SecondPractice", ...nextRace.SecondPractice },
            { type: "ThirdPractice", ...nextRace.ThirdPractice },
            { type: "SprintQualifying", ...nextRace.SprintQualifying },
            { type: "Sprint", ...nextRace.Sprint },
            { type: "Qualifying", ...nextRace.Qualifying },
            { type: "race", date: nextRace.date, time: nextRace.time },
          ].map((session) => ({
            ...session,
            timeStamp: new Date(`${session.date}T${session.time}`).getTime(),
            endTimeStamp:
              new Date(`${session.date}T${session.time}`).getTime() +
              2 * 60 * 60 * 1000,
          }));

          // Find ongoing session first
          const currentSession = sessions.find(
            (session) => now >= session.timeStamp && now <= session.endTimeStamp
          );

          // If there's an ongoing session, use it
          if (currentSession) {
            setRaceDate(`${currentSession.date}T${currentSession.time}`);
            setSessionName(getSessionName(currentSession.type));
          } else {
            // Otherwise find next session
            const nextSession = sessions.find(
              (session) => session.timeStamp > now
            );

            if (nextSession) {
              setRaceDate(`${nextSession.date}T${nextSession.time}`);
              setSessionName(getSessionName(nextSession.type));
            }
          }
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
      const sessionTime = new Date(raceDate).getTime();
      const sessionEndTime = sessionTime + 2 * 60 * 60 * 1000; // Adding 2 hours
      const difference = sessionTime - now;

      if (now >= sessionTime && now <= sessionEndTime) {
        setSessionOngoing(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      if (difference > 0) {
        setSessionOngoing(false);
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      setSessionOngoing(false);
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [raceDate, sessionOngoing]);

  if (isLoading) {
    return <CountdownCardSkeleton />;
  }

  return (
    <Link
      href={sessionOngoing ? "/live" : "#"}
      className={sessionOngoing ? "block" : ""}
      onClick={(e) => !sessionOngoing && e.preventDefault()}
    >
      <div
        className={`bg-gradient-to-tr from-red-900 to-red-700 p-5 rounded-lg shadow-lg border border-red-600 max-w-md text-center ${
          sessionOngoing
            ? "cursor-pointer hover:scale-[1.02] transition-transform"
            : "cursor-default"
        }`}
        role={sessionOngoing ? "button" : "presentation"}
      >
        <h2 className="text-lg text-left flex items-baseline">
          {season}&nbsp;
          {timeLeft.days === 0 ? (
            <>
              {raceName.split("Grand Prix")}:&nbsp;
              <span className="text-sm">{sessionName}</span>
            </>
          ) : (
            raceName
          )}
        </h2>

        <div className="flex justify-between items-center">
          {sessionOngoing ? (
            <>
              <div className="flex justify-start items-center gap-3 text-xl animate-pulse">
                <div
                  style={{
                    width: "15px",
                    height: "15px",
                    borderRadius: "15px",
                    backgroundColor: "white",
                  }}
                />
                <span>Live</span>
              </div>
            </>
          ) : (
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
          )}
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
    </Link>
  );
};

export default CountdownCard;
