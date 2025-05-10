"use client";
import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { Pause, Play } from "lucide-react";
import { liveToJolpicaConstructor } from "@/lib/utils";

const pad = (n: any, l: any) => {
  let str = `${n}`;
  while (str.length < l) str = `0${str}`;
  return str;
};

// const secondsToMinutes = (seconds: number) => {
//   const minutes = Math.floor(seconds / 60);
//   const remaining = Math.floor(seconds - minutes * 60);
//   return `${pad(minutes, 2)}:${pad(remaining, 2)}`;
// };

export default function Radio({ radio, path, driver }: any) {
  const [playing, setPlaying] = useState<Boolean>(false);
  const [duration, setDuration] = useState<any>(0);
  const [progress, setProgress] = useState<any>(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleEnd = () => {
      setPlaying(false);
      setProgress(0);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("ended", handleEnd);
    }

    return () => {
      audioRef.current?.removeEventListener("ended", handleEnd);
    };
  }, []);

  useEffect(() => {
    if (playing && typeof audioRef?.current?.play === "function") {
      audioRef.current.play();
      intervalRef.current = setInterval(() => {
        setProgress(audioRef?.current?.currentTime);
      }, 100);
    }
    if (!playing && typeof audioRef.current?.pause === "function") {
      audioRef.current.pause();
      clearInterval(intervalRef?.current);
    }
  }, [playing]);

  const percent = (progress / duration) * 100;

  return (
    <li className="flex items-center p-3 w-[450px] justify-between gap-2 ">
      <span
        style={{
          color: "grey",
        }}
      >
        {moment.utc(radio.Utc).format("HH:mm:ss")}
      </span>
      <span
        className="gap-2 w-24 flex flex-row"
        style={{
          color: driver?.TeamColour ? `#${driver.TeamColour}` : "#cbd5db",
        }}
      >
        <img
          src={`/teams/${liveToJolpicaConstructor(driver?.TeamName)}.svg`}
          alt={driver?.TeamName}
          className="w-6 h-6"
          onError={(e) => (e.currentTarget.src = "/vercel.svg")}
        />
        {driver?.Tla}
      </span>
      <div className="inline-flex items-center gap-2">
        {playing ? (
          <Pause onClick={() => setPlaying(false)} size={22} />
        ) : (
          <Play onClick={() => setPlaying(true)} size={22} />
        )}
        <span
          className="inline-block mr-2 rounded-xl w-40 h-2"
          style={{
            backgroundColor: "dimgrey",
            background: `linear-gradient(to right, lightgray ${percent}%, dimgrey ${percent}%)`,
          }}
        />
      </div>
      <audio
        ref={audioRef}
        preload="none"
        src={path}
        onLoadedMetadata={() => {
          setDuration(audioRef?.current?.duration);
        }}
        // controls
        style={{ display: "none" }}
      />
    </li>
  );
}
