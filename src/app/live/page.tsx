"use client";
import Driver from "@/components/ui/Driver";
import { f1LiveService } from "@/lib/api";
import { useEffect, useState } from "react";
import moment from "moment";
import Map, { bearingToCardinal } from "@/components/ui/Map";
import Radio from "@/components/ui/Radio";
import { AlertCircle, CloudRain } from "lucide-react";
import LatestMessage from "@/components/ui/LatestMessage";

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

const f1Url = "https://livetiming.formula1.com";

const sortPosition = (a: any, b: any) => {
  const [, aLine] = a;
  const [, bLine] = b;
  const aPos = Number(aLine.Position);
  const bPos = Number(bLine.Position);
  return aPos - bPos;
};

const sortUtc = (a: any, b: any) => {
  const aDate = moment.utc(a.Utc);
  const bDate = moment.utc(b.Utc);
  return bDate.diff(aDate);
};

export const getFlagDetails = (flag: string) => {
  switch (flag?.toLowerCase()) {
    case "allclear":
      return { shadow: "green", bg: "#006400", text: "Track Clear" };
    case "green":
      return { shadow: "green", bg: "#006400", text: "Green" };
    case "yellow":
      return { shadow: "yellow", bg: "#ffb900", text: "Yellow" };
    case "scdeployed":
      return { shadow: "yellow", bg: "#ffb900", text: "Safety Car" };
    case "vscdeployed":
      return { shadow: "yellow", bg: "#ffb900", text: "Virtual Safety Car" };
    case "double yellow":
      return { shadow: "yellow", bg: "#ffb900", text: "Double Yellow" };
    case "red":
      return { shadow: "red", bg: "crimson", text: "Red Flag" };
    case "blue":
      return { shadow: "blue", bg: "#1f6da1", text: "Blue" };
    default:
      return { shadow: "transparent", bg: "transparent" };
  }
};

export default function Live() {
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<LiveState>({});
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [connectionFailed, setConnectionFailed] = useState(false);

  const [openTranscriptionId, setOpenTranscriptionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const handleStateUpdate = (newState: any) => {
      setState(newState);
    };

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionFailed(false);
      setRetryAttempt(0);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setState({});
    };

    const handleRetrying = ({ attempt, maxRetries }: any) => {
      setRetryAttempt(attempt);
      setConnectionFailed(false);
    };

    const handleConnectionFailed = () => {
      setConnectionFailed(true);
    };

    if (!f1LiveService.isConnected) {
      f1LiveService.connect();
    }

    f1LiveService.on("stateUpdate", handleStateUpdate);
    f1LiveService.on("connect", handleConnect);
    f1LiveService.on("disconnect", handleDisconnect);
    f1LiveService.on("retrying", handleRetrying);
    f1LiveService.on("connectionFailed", handleConnectionFailed);

    return () => {
      f1LiveService.off("stateUpdate", handleStateUpdate);
      f1LiveService.off("connect", handleConnect);
      f1LiveService.off("disconnect", handleDisconnect);
      f1LiveService.off("retrying", handleRetrying);
      f1LiveService.off("connectionFailed", handleConnectionFailed);
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
    RaceControlMessages,
    SessionData,
    TeamRadio,
  } = state;

  const extrapolatedTimeRemaining =
    ExtrapolatedClock?.Utc && ExtrapolatedClock?.Remaining
      ? ExtrapolatedClock?.Extrapolating
        ? moment
            .utc(
              Math.max(
                moment
                  .duration(ExtrapolatedClock?.Remaining)
                  .subtract(
                    moment.utc().diff(moment.utc(ExtrapolatedClock?.Utc))
                  )
                  .asMilliseconds(),
                0
              )
            )
            .format("HH:mm:ss")
        : ExtrapolatedClock?.Remaining
      : undefined;

  const latestMessage = [
    ...Object.values(RaceControlMessages?.Messages || {}),
    ...Object.values(SessionData?.StatusSeries || {}),
  ].sort(sortUtc)[0];

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
      <LatestMessage message={latestMessage} />
      <div className="flex flex-col md:flex-row m-2 p-2 justify-between items-center overflow-hidden rounded-lg border border-zinc-800 gap-5">
        <div title="Session Data" className="flex items-center gap-2">
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
              {extrapolatedTimeRemaining}
            </p>
          </div>
          {/* <div className="relative flex h-[55px] w-[55px] items-center justify-center rounded-full">
            <div className="mt-2 flex flex-col items-center gap-0.5">
              <AlertCircle size={18} color="grey" />
            </div>
          </div> */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.target as HTMLFormElement);
              const delaySecValue = Number(form.get("delaySec"));
              const delayMsValue = delaySecValue * 1000; 

              f1LiveService.setDelay(delayMsValue);
            }}
            className="flex items-center gap-2"
          >
            <p className="text-sm">Delay</p>
            <input
              type="number"
              name="delaySec"
              min="0"
              step="1"
              defaultValue={0}
              className="w-14 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
            />
            <p className="text-sm">s</p>
            <button
              type="submit"
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Apply
            </button>
          </form>
        </div>
        <div
          title="Weather Data"
          className="flex justify-between gap-4 w-full md:w-auto  "
        >
          <div
            className="relative flex h-[55px] w-[55px] items-center justify-center rounded-full"
            title="Track temperature"
          >
            <div className="mt-2 flex flex-col items-center gap-0.5">
              <p className="flex h-[22px] shrink-0 text-xl leading-[normal] font-medium text-white">
                {String(Number(WeatherData?.TrackTemp))}
              </p>
              <p className="flex h-[11px] shrink-0 text-center text-[10px] leading-[normal] font-medium text-green-500">
                TRC
              </p>
            </div>
          </div>
          <div className="relative flex h-[55px] w-[55px] items-center justify-center rounded-full">
            <div className="mt-2 flex flex-col items-center gap-0.5">
              <p className="flex h-[22px] shrink-0 text-xl leading-[normal] font-medium text-white">
                {String(Number(WeatherData?.AirTemp))}
              </p>
              <p className="flex h-[11px] shrink-0 text-center text-[10px] leading-[normal] font-medium text-green-500">
                AIR
              </p>
            </div>
          </div>
          <div className="relative flex h-[55px] w-[55px] items-center justify-center rounded-full">
            <div className="mt-2 flex flex-col items-center gap-0.5">
              <p className="flex h-[22px] shrink-0 text-xl leading-[normal] font-medium text-white">
                {String(Number(WeatherData?.Humidity))}
              </p>
              <p className="flex h-[11px] shrink-0 text-center text-[10px] leading-[normal] font-medium text-blue-500">
                Humidity
              </p>
            </div>
          </div>
          <div className="relative flex h-[55px] w-[55px] items-center justify-center rounded-full">
            <div className="mt-2 flex flex-col items-center gap-0.5">
              <p className="flex h-[22px] shrink-0 text-xl leading-[normal] font-medium text-white">
                {(Number(WeatherData?.WindSpeed) * 3.6).toFixed(2)}{" "}
              </p>
              <p className="flex h-[11px] shrink-0 text-center text-[10px] leading-[normal] font-medium text-blue-500">
                Wind
              </p>
            </div>
          </div>
          <div className="relative flex h-[55px] w-[55px] items-center justify-center rounded-full">
            <div className="mt-2 flex flex-col items-center gap-0.5">
              {Number(WeatherData?.Rainfall) > 0 ? (
                <CloudRain color="blue" />
              ) : (
                <CloudRain color="dimgrey" />
              )}
            </div>
          </div>
        </div>
        <div title="Laps/Track Info" className="flex justify-end">
          <div className="flex flex-row items-center gap-4 md:justify-self-end">
            {!!LapCount && (
              <p className="text-2xl font-bold whitespace-nowrap">
                {LapCount.CurrentLap} / {LapCount.TotalLaps}
              </p>
            )}
            <div
              className="flex h-8 items-center truncate rounded-md px-2"
              style={{
                boxShadow: `${
                  getFlagDetails(TrackStatus?.Message).shadow
                } 0px 0px 60px 10px`,
                backgroundColor: `${getFlagDetails(TrackStatus?.Message).bg}`,
              }}
            >
              <p className="text-lg font-medium">
                {getFlagDetails(TrackStatus?.Message).text}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto md:rounded-lg">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full flex-col gap-2 2xl:flex-row">
            <div title="Telemetry" className="overflow-x-auto">
              <div className="flex w-fit flex-col gap-0.5">
                <div
                  className="grid items-center gap-2 p-1 px-2 mx-2 text-sm font-medium text-zinc-500"
                  style={{
                    gridTemplateColumns:
                      "2.5rem 6.5rem 3.5rem 5.5rem 4.5rem 5rem 6.5rem 25rem 6rem 6rem",
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
                  <div>
                    {Object.entries(TimingData?.Lines)
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
                          SessionName={SessionInfo?.Name}
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
            <div
              title="Track Map"
              className="flex-1 2xl:max-h-[50rem] flex items-center"
            >
              {/* For Track map  */}
              <div>
                {!!Position ? (
                  <Map
                    circuit={SessionInfo.Meeting.Circuit.Key}
                    Position={Position.Position[Position.Position.length - 1]}
                    DriverList={DriverList}
                    TimingData={TimingData}
                    TrackStatus={TrackStatus}
                    WindDirection={WeatherData.WindDirection}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "400px",
                    }}
                  >
                    <p>NO DATA YET</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 2xl:flex-row">
            <div className="flex-1 p-4" title="Race Control">
              <div>
                <p>
                  <strong>Race Control</strong>
                </p>
              </div>
              <div>
                {RaceControlMessages ? (
                  <ul
                    style={{
                      listStyle: "none",
                      height: "400px",
                      overflow: "auto",
                      flexGrow: 1,
                      scrollbarWidth: "thin",
                    }}
                  >
                    {[
                      ...Object.values(RaceControlMessages?.Messages),
                      ...Object.values(SessionData?.StatusSeries),
                    ]
                      .sort(sortUtc)
                      .map((event: any, i: number) => (
                        <li
                          key={`race-control-${event.Utc}-${i}`}
                          style={{ padding: "0.3rem", display: "flex" }}
                          className="font-mono flex flex-col text-slate-300"
                        >
                          <div className="mr-2 whitespace-nowrap">
                            <span className="text-gray-500 mr-2">
                              {moment(event.Utc).local().format("HH:mm:ss")}
                            </span>
                            <span className="text-gray-700">
                              {moment.utc(event.Utc).format("HH:mm")}
                            </span>
                            <span className="text-gray-500">
                              {event.Lap && ` / Lap ${event.Lap}`}
                            </span>
                          </div>
                          <div className="flex flex-row gap-2 leading-none">
                            {event.Category === "Flag" && (
                              <img
                                alt={event.Flag}
                                src={`/flags/${
                                  event.Flag === "CLEAR" ? "GREEN" : event.Flag
                                }.svg`}
                                loading="lazy"
                                decoding="async"
                                height={30}
                                width={30}
                              />
                            )}
                            {event.Message && <div>{event.Message.trim()}</div>}
                            {event.TrackStatus && (
                              <div>TrackStatus: {event.TrackStatus}</div>
                            )}
                            {event.SessionStatus && (
                              <div>SessionStatus: {event.SessionStatus}</div>
                            )}
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <>
                    <p>NO DATA YET</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 p-" title="Team Radio">
              <div>
                <p>
                  <strong>Team Radio</strong>
                </p>
              </div>
              <div>
                {TeamRadio ? (
                  <ul
                    style={{
                      listStyle: "none",
                      height: "400px",
                      overflow: "auto",
                      flexGrow: 1,
                      scrollbarWidth: "thin",
                    }}
                  >
                    {[...Object.values(TeamRadio?.Captures).sort(sortUtc)].map(
                      (radio: any, i: number) => {
                        const driver = DriverList[radio?.RacingNumber];
                        return (
                          <Radio
                            key={`team-radio-${radio.Utc}-${i}`}
                            radio={radio}
                            path={`${f1Url}/static/${SessionInfo.Path}${radio?.Path}`}
                            driver={driver}
                            isTranscriptionOpen={
                              openTranscriptionId === `${radio.Utc}-${i}`
                            }
                            onTranscribe={() =>
                              setOpenTranscriptionId(`${radio.Utc}-${i}`)
                            }
                            onCloseTranscription={() =>
                              setOpenTranscriptionId(null)
                            }
                          />
                        );
                      }
                    )}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>NO DATA YET</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
