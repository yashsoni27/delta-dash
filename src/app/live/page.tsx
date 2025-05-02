"use client";
import Driver from "@/components/ui/Driver";
import { f1LiveService } from "@/lib/api";
import { useEffect, useState } from "react";

interface LiveState {
  Heartbeat?: any;
  SessionInfo?: any;
  TrackStatus?: any;
  LapCount?: any;
  ExtrapolatedClock?: any;
  WeatherData?: any;
  DriverList?: any;
  SessionData?: any;
  RaceControlMessages?: any;
  TimingData?: any;
  TimingAppData?: any;
  TimingStats?: any;
  CarData?: any;
  Position?: any;
  TeamRadio?: any;
}

const sortPosition = (a: any, b: any) => {
  const [, aLine] = a;
  const [, bLine] = b;
  const aPos = Number(aLine.Position);
  const bPos = Number(bLine.Position);
  return aPos - bPos;
};

export default function Live() {
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<LiveState>({});
  const [updated, setUpdated] = useState<Date>(new Date());
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [connectionFailed, setConnectionFailed] = useState(false);

  useEffect(() => {
    if (!f1LiveService.isConnected) {
      f1LiveService.connect();
    }

    f1LiveService.on("stateUpdate", (newState) => {
      setState(newState);
      setUpdated(new Date());
    });

    f1LiveService.on("connect", () => {
      setIsConnected(true);
      setConnectionFailed(false);
      setRetryAttempt(0);
    });

    f1LiveService.on("disconnect", () => {
      setIsConnected(false);
      setState({});
    });

    f1LiveService.on("retrying", ({ attempt, maxRetries }) => {
      setRetryAttempt(attempt);
      setConnectionFailed(false);
    });

    f1LiveService.on("connectionFailed", () => {
      setConnectionFailed(true);
    });

    return () => {
      f1LiveService.off("stateUpdate", setState);
      f1LiveService.off("connect", () => setIsConnected(true));
      f1LiveService.off("disconnect", () => setIsConnected(false));
      f1LiveService.off("retrying", () => {});
      f1LiveService.off("connectionFailed", () => {});
    };
  }, []);

  const {
    SessionInfo,
    TrackStatus,
    LapCount,
    ExtrapolatedClock,
    WeatherData,
    DriverList,
    TimingData,
    TimingAppData,
    TimingStats,
    CarData,
    Position,
  } = state;

  // Don't render if not connected
  if (!isConnected) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        {connectionFailed ? (
          <div className="text-center">
            <p className="text-lg font-bold text-red-500">Connection failed</p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              onClick={() => {
                setConnectionFailed(false);
                setRetryAttempt(0);
                f1LiveService.connect();
              }}
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-bold">
              Connecting
              {retryAttempt > 0 ? ` (Attempt ${retryAttempt}/5)` : "..."}
            </p>
            <p className="text-sm text-zinc-400 animate-pulse">
              {retryAttempt > 0
                ? "Retrying connection..."
                : "Establishing connection..."}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!SessionInfo) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p className="text-lg font-bold">Waiting for session data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-row m-2 justify-between overflow-hidden rounded-lg border border-zinc-800 p-2 md:flex">
        <div className="flex items-center gap-2">
          <div className="flex content-center justify-center">
            <img
              alt={SessionInfo?.Meeting?.Country?.Code}
              loading="lazy"
              decoding="async"
              width={70}
              height={35}
              className="overflow-hidden rounded-lg"
              src={`/country-flags/${SessionInfo?.Meeting?.Country?.Code}.svg`}
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="truncate text-sm leading-none font-medium text-white">
              {SessionInfo?.Meeting?.Name}: {SessionInfo?.Name}
            </h1>
            <p className="text-2xl leading-none font-bold">
              {ExtrapolatedClock?.Remaining}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="flex flex-row items-center gap-4 md:justify-self-end">
            <p className="text-2xl font-bold whitespace-nowrap">
              {LapCount?.CurrentLap} / {LapCount?.TotalLaps}
            </p>
            <div
              className="flex h-8 items-center truncate rounded-md px-2 "
              // style={{ boxShadow: "rgb(52, 185, 129) 0px 0px 60px 10px;" }}
            >
              <p className="text-lg font-medium">{TrackStatus?.Message}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="no-scrollbar flex-1 overflow-auto md:rounded-lg">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full flex-col gap-2 2xl:flex-row">
            <div className="overflow-x-auto">
              <div className="flex w-fit flex-col gap-0.5">
                <div
                  className="grid items-center gap-2 p-1 px-2 mx-2 text-sm font-medium text-zinc-500"
                  style={{
                    gridTemplateColumns:
                      "3rem 6.5rem 3.5rem 5.5rem 3rem 5rem 6.5rem 25rem 6rem 6rem",
                  }}
                >
                  <p>Pos</p>
                  <p>Driver</p>
                  <p>DRS</p>
                  <p>Tyre</p>
                  <p>Info</p>
                  <p>Gap</p>
                  <p>LapTime</p>
                  <p>Sectors</p>
                  <p>Gear/RPM</p>
                  <p>Speed</p>
                </div>
              </div>
              {TimingData && CarData ? (
                <>
                  <div
                    style={{ borderRight: "1px solid var(--colour-border)" }}
                  >
                    {Object.entries(TimingData.Lines)
                      .sort(sortPosition)
                      .map(([racingNumber, line]) => (
                        <Driver
                          key={`timing-data-${racingNumber}`}
                          racingNumber={racingNumber}
                          line={line}
                          DriverList={DriverList}
                          CarData={CarData}
                          TimingAppData={TimingAppData}
                          TimingStats={TimingStats}
                        />
                      ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p>NO DATA YET</p>
                </div>
              )}
            </div>
            <div className="flex-1 2xl:max-h-[50rem]">
              {/* For Track map  */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
