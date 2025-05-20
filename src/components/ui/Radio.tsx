"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { MessageSquareText, Pause, Play } from "lucide-react";
import { liveToJolpicaConstructor } from "@/lib/utils";
import { ElevenLabsClient } from "elevenlabs";
import { transcriptionService } from "@/lib/api";

function groupBySpeaker(words: any[]) {
  if (!words) return;
  const groups = [];
  let currentSpeaker = null;
  let currentText = "";

  for (const w of words) {
    if (w.type === "word") {
      if (w.speaker_id !== currentSpeaker) {
        if (currentText)
          groups.push({ speaker: currentSpeaker, text: currentText.trim() });
        currentSpeaker = w.speaker_id;
        currentText = w.text + " ";
      } else {
        currentText += w.text + " ";
      }
    } else if (w.type === "spacing") {
      currentText += " ";
    }
  }
  if (currentText)
    groups.push({ speaker: currentSpeaker, text: currentText.trim() });

  console.log(groups);
  return groups;
}

export default function Radio({
  radio,
  path,
  driver,
  isTranscriptionOpen,
  onTranscribe,
  onCloseTranscription,
}: any) {
  const [playing, setPlaying] = useState<Boolean>(false);
  const [duration, setDuration] = useState<any>(0);
  const [progress, setProgress] = useState<any>(0);
  const [transcription, setTranscription] = useState<any>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function getSpeakerColor(speakerId: string | null) {
    if (!speakerId) return "#e0e0e0";
    if (speakerId == "speaker_0" && driver?.TeamColour) {
      return `#${driver.TeamColour}`;
    }
    return "#e0e0e0";
  }

  const transcribeAudio = async () => {
    if (!path) return;
    setIsTranscribing(true);
    try {
      // const client = new ElevenLabsClient({
      //   apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
      // });
      // const response = await fetch(
      //   `/api/proxy?url=${encodeURIComponent(path)}`
      // );
      // const audioBlob = await response.blob();

      // const result = await client.speechToText.convert({
      //   file: audioBlob,
      //   model_id: "scribe_v1",
      //   tag_audio_events: true,
      //   language_code: "eng",
      //   diarize: true,
      // });
      const result = await transcriptionService.transcribeAudio(path);

      setTranscription(result);
      // setShowTranscription(true);
    } catch (e) {
      console.log("Transcription error: ", e);
    } finally {
      setIsTranscribing(false);
    }
  };

  const groupedTranscription = useMemo(
    () =>
      transcription && transcription.words
        ? groupBySpeaker(transcription.words)
        : [],
    [transcription]
  );

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
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    }
  }, [playing]);

  const percent = (progress / duration) * 100;

  return (
    <li className="flex items-center p-3 w-[500px] justify-between gap-2 ">
      <div>
        <span className="text-sm text-gray-500 mr-2">
          {moment(radio.Utc).local().format("HH:mm:ss")}
        </span>
        <span className="text-xs text-gray-700 mr-2">
          {moment.utc(radio.Utc).format("HH:mm")}
        </span>
      </div>
      <div
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
      </div>
      <div className="inline-flex items-center gap-2 relative">
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
        <button
          onClick={() => {
            onTranscribe();
            transcribeAudio();
          }}
          disabled={isTranscribing}
          className="p-1 rounded-3xl hover:bg-gray-700"
          id="transcribe-btn"
        >
          {isTranscribing ? (
            <MessageSquareText size={20} color="#787878" />
          ) : (
            <MessageSquareText size={20} color="#d0d0d1" />
          )}
        </button>
        {groupedTranscription &&
          groupedTranscription?.length > 0 &&
          isTranscriptionOpen && (
            <div
              className="absolute z-10 left-full top-0 ml-2 w-[350px] max-w-[25vw] border border-gray-600 bg-black rounded-lg flex flex-col gap-2 text-sm"
              style={{ pointerEvents: "auto" }}
            >
              <button
                onClick={onCloseTranscription}
                className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg font-bold"
                style={{ pointerEvents: "auto" }}
                tabIndex={0}
                aria-label="Close transcription"
              >
                ×
              </button>
              <div className="pt-6 pb-2 px-2 flex flex-col gap-2">
                {groupedTranscription?.map((group, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded`}
                    style={{
                      color: getSpeakerColor(group.speaker),
                    }}
                  >
                    "{group.text}"
                  </div>
                ))}
              </div>
            </div>
          )}
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
