"use client";
import { multViewerService } from "@/lib/api";
import { Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";

const space = 1000;

const rad = (deg: number) => deg * (Math.PI / 180);
const deg = (rad: number) => rad / (Math.PI / 180);

const rotate = (x: number, y: number, a: number, px: number, py: number) => {
  const c = Math.cos(rad(a));
  const s = Math.sin(rad(a));

  x -= px;
  y -= py;

  const newX = x * c - y * s;
  const newY = y * c + x * s;

  return [newX + px, (newY + py) * -1];
};

const getTrackStatusColor = (status: string) => {
  switch (status) {
    case "2":
    case "4":
    case "6":
    case "7":
      return "yellow";
    case "5":
      return "red";
    default:
      return "white";
  }
};

const sortDriverPosition = (Lines: any) => (a: any, b: any) => {
  const [racingNumberA] = a;
  const [racingNumberB] = b;

  const driverA = Lines[racingNumberA];
  const driverB = Lines[racingNumberB];

  return Number(driverB?.Position) - Number(driverA?.Position);
};

const bearingToCardinal = (bearing: any) => {
  const cardinalDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return cardinalDirections[Math.floor(bearing / 45) % 8];
};

export default function Map({
  circuit,
  Position,
  DriverList,
  TimingData,
  TrackStatus,
  WindDirection,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<any>(null);
  const [[minX, minY, widthX, widthY], setBounds] = useState<any>([
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
  const [stroke, setStroke] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const rawData = await multViewerService.getTrack(circuit);
      if (rawData) {
        const px = (Math.max(...rawData.x) - Math.min(...rawData.x)) / 2;
        const py = (Math.max(...rawData.y) - Math.min(...rawData.y)) / 2;

        rawData.transformedPoints = rawData.x.map((x: any, i: number) =>
          rotate(x, rawData.y[i], rawData.rotation, px, py)
        );

        const cMinX =
          Math.min(...rawData.transformedPoints.map(([x]: any) => x)) - space;
        const cMinY =
          Math.min(...rawData.transformedPoints.map(([, y]: any) => y)) - space;
        const cWidthX =
          Math.max(...rawData.transformedPoints.map(([x]: any) => x)) -
          cMinX +
          space * 2;
        const cWidthY =
          Math.max(...rawData.transformedPoints.map(([, y]: any) => y)) -
          cMinY +
          space * 2;

        setBounds([cMinX, cMinY, cWidthX, cWidthY]);

        const cStroke = (cWidthX + cWidthY) / 225;
        setStroke(cStroke);

        rawData.corners = rawData.corners.map((corner: any) => {
          const transformedCorner = rotate(
            corner.trackPosition.x,
            corner.trackPosition.y,
            rawData.rotation,
            px,
            py
          );

          const transformedLabel = rotate(
            corner.trackPosition.x + 4 * cStroke * Math.cos(rad(corner.angle)),
            corner.trackPosition.y + 4 * cStroke * Math.sin(rad(corner.angle)),
            rawData.rotation,
            px,
            py
          );

          return { ...corner, transformedCorner, transformedLabel };
        });

        rawData.startAngle = deg(
          Math.atan(
            (rawData.transformedPoints[3][1] -
              rawData.transformedPoints[0][1]) /
              (rawData.transformedPoints[3][0] -
                rawData.transformedPoints[0][0])
          )
        );

        setData(rawData);
      }
    };
    fetchData();
  }, [circuit]);

  const hasData = !!data;

  const mapContainerClasses = expanded
    ? "bg-slate-950 p-1 fixed top-[1rem] bottom-[1rem] left-[1rem] right-[1rem] border border-gray-300 rounded select-none shadow-[0_0_0_1000px_rgba(0,0,0,0.25)]"
    : "bg-slate-950 p-1 relative border-none rounded select-none";

  return hasData ? (
    <>
      <div className={mapContainerClasses}>
        <div className="text-xs">
          <div
            className="flex"
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
            }}
          >
            Status:&nbsp;
            <p style={{ color: getTrackStatusColor(TrackStatus.Status) }}>
              {TrackStatus.Message}
            </p>
          </div>
          <div
            style={{
              color: getTrackStatusColor(TrackStatus.Status),
              position: "absolute",
              top: "calc(1rem + 20px)",
              left: "1rem",
            }}
          >
            N
            <span
              style={{
                display: "inline-block",
                marginLeft: "0.5rem",
                transform: `rotate(${-data.rotation}deg)`,
              }}
            >
              ↑
            </span>
          </div>
          <div
            style={{
              color: getTrackStatusColor(TrackStatus.Status),
              position: "absolute",
              top: "calc(1rem + 40px)",
              left: "1rem",
            }}
          >
            Wind {bearingToCardinal(Number(WindDirection))}
            <span
              style={{
                display: "inline-block",
                marginLeft: "0.5rem",
                transform: `rotate(${
                  (WindDirection - data.rotation) % 360
                }deg)`,
              }}
            >
              ↑
            </span>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="absolute top-[1rem] right-[1rem]"
          >
            {expanded ? <Minimize /> : <Maximize />}
          </button>
        </div>
        <svg
          viewBox={`${minX} ${minY} ${widthX} ${widthY}`}
          width="100%"
          height={expanded ? "100%" : "500px"}
        >
          <path
            stroke={getTrackStatusColor(TrackStatus.Status)}
            strokeWidth={stroke}
            strokeLinejoin="round"
            fill="transparent"
            d={`M${data.transformedPoints[0][0]},${
              data.transformedPoints[0][1]
            } ${data.transformedPoints
              .map(([x, y]: any) => `L${x},${y}`)
              .join(" ")}`}
          />
          <rect
            x={data.transformedPoints[0][0]}
            y={data.transformedPoints[0][1]}
            width={stroke * 4}
            height={stroke}
            fill="black"
            stroke="white"
            strokeWidth={stroke / 2}
            transform={`translate(${stroke * -2} ${(stroke * -1) / 2}) rotate(${
              data.startAngle + 90
            }, ${data.transformedPoints[0][0] + stroke * 2}, ${
              data.transformedPoints[0][1] + stroke / 2
            })`}
          />
          {Object.entries(Position.Entries ?? {})
            .sort(sortDriverPosition(TimingData.Lines))
            .map(([racingNumber, pos]: [string, any]) => {
              const driver = DriverList[racingNumber];
              const timingData = TimingData.Lines[racingNumber];
              const onTrack =
                pos.Status === "OnTrack" &&
                (timingData ? !timingData.InPit : true);
              const out =
                timingData?.KnockedOut ||
                timingData?.Retired ||
                timingData?.Stopped;
              const [rx, ry] = rotate(
                pos.X,
                pos.Y,
                data.rotation,
                (Math.max(...data.x) - Math.min(...data.x)) / 2,
                (Math.max(...data.y) - Math.min(...data.y)) / 2
              );
              const fontSize = stroke * 2.5;
              return driver && !out ? (
                <g key={`pos-${racingNumber}`} opacity={onTrack ? 1 : 0.5}>
                  <circle
                    cx={rx}
                    cy={ry}
                    r={stroke * (onTrack ? 1.25 : 0.75)}
                    fill={driver?.TeamColour ? `#${driver.TeamColour}` : "grey"}
                    stroke="transparent"
                    strokeWidth={fontSize / 10}
                    style={{ transition: "1s linear" }}
                  />
                  <text
                    x={0}
                    y={0}
                    fill={driver?.TeamColour ? `#${driver.TeamColour}` : "grey"}
                    fontSize={fontSize}
                    // fontWeight="bold"
                    stroke="transparent"
                    strokeWidth={fontSize / 20}
                    style={{
                      transform: `translate(${rx + stroke * 1.5}px, ${
                        ry + stroke
                      }px)`,
                      transition: "1s linear",
                    }}
                  >
                    {driver.Tla}
                  </text>
                </g>
              ) : null;
            })}
          {data.corners.map((corner: any) => {
            let string = `${corner.number}`;
            if (corner.letter) string = string + corner.letter;

            const fontSize = stroke * 1.8;

            const [cornerX, cornerY] = corner.transformedCorner;
            const [labelX, labelY] = corner.transformedLabel;

            const lineX = labelX + fontSize * (string.length * 0.25);
            const lineY = labelY - (labelY > cornerY ? fontSize * 0.7 : 0);

            return (
              <g key={`corner-${corner.number}}`}>
                <text
                  x={labelX}
                  y={labelY}
                  fontSize={fontSize}
                  fontWeight="bold"
                  fill="dimgrey"
                  // stroke="transparent"
                  strokeWidth={fontSize / 40}
                >
                  {string}
                </text>
                <path
                  stroke="dimgrey"
                  strokeWidth={stroke / 2}
                  opacity={0.25}
                  d={`M${cornerX},${cornerY} L${lineX},${lineY}`}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </>
  ) : null;
}
