"use client";
import { multViewerService } from "@/lib/api";
import { CircleArrowUp, Maximize, Minimize } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const space = 1000;

const rad = (deg: number) => deg * (Math.PI / 180);
const deg = (r: number) => r / (Math.PI / 180);

const rotate = (x: number, y: number, a: number, px: number, py: number): [number, number] => {
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

const sortDriverPosition = (Lines: any) => (a: any, b: any) =>
  Number(Lines[b[0]]?.Position) - Number(Lines[a[0]]?.Position);

// ---------------------------------------------------------------------------
// Arc-length parameterisation helpers
// ---------------------------------------------------------------------------

interface ArcTable {
  dist: number[];
  total: number;
}

function buildArcTable(points: [number, number][]): ArcTable {
  const dist = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    dist.push(dist[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  return { dist, total: dist[dist.length - 1] };
}

/** Returns the [x, y] coordinate at fraction t (0..1) along the track path. */
function pointAtFraction(
  t: number,
  points: [number, number][],
  table: ArcTable
): [number, number] {
  const target = Math.min(Math.max(t, 0), 0.9999) * table.total;
  let lo = 0;
  let hi = table.dist.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (table.dist[mid] <= target) lo = mid;
    else hi = mid;
  }
  const span = table.dist[lo + 1] - table.dist[lo];
  const alpha = span > 0 ? (target - table.dist[lo]) / span : 0;
  return [
    points[lo][0] + alpha * (points[lo + 1][0] - points[lo][0]),
    points[lo][1] + alpha * (points[lo + 1][1] - points[lo][1]),
  ];
}

// ---------------------------------------------------------------------------
// Minisector helpers
// ---------------------------------------------------------------------------

interface SegInfo {
  /** Index of the last "touched" segment (0-based). */
  index: number;
  /** Total number of minisegments for this driver this lap. */
  total: number;
}

/**
 * Flattens all sector→segment data and returns the index of the last segment
 * the driver has entered or completed, plus the total count.
 *
 * Segment status meanings:
 *   0    = not yet reached
 *   2048 = currently being traversed (yellow)
 *   2049 = completed personal best (green)
 *   2051 = completed overall fastest (purple)
 *   2064 = blue flag sector
 */
function getSegmentInfo(line: any): SegInfo | null {
  const sectors: any[] = Array.isArray(line?.Sectors)
    ? line.Sectors
    : Object.values(line?.Sectors ?? {});
  if (!sectors.length) return null;

  const segs: any[] = sectors.flatMap((s: any) =>
    Array.isArray(s?.Segments) ? s.Segments : Object.values(s?.Segments ?? {})
  );
  if (!segs.length) return null;

  let lastTouched = 0;
  for (let i = 0; i < segs.length; i++) {
    const st = segs[i]?.Status;
    if (st && st !== 0) lastTouched = i;
  }
  return { index: lastTouched, total: segs.length };
}

/** Parse "1:23.456" or "23.456" → milliseconds. */
function lapTimeToMs(t: string): number | null {
  if (!t) return null;
  const parts = t.split(":");
  if (parts.length === 2) {
    return (parseInt(parts[0], 10) * 60 + parseFloat(parts[1])) * 1000;
  }
  const v = parseFloat(t);
  return isNaN(v) ? null : v * 1000;
}

// ---------------------------------------------------------------------------
// Exports reused by page.tsx
// ---------------------------------------------------------------------------

export const bearingToCardinal = (bearing: any) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.floor(bearing / 45) % 8];
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DriverSegState {
  index: number;
  total: number;
  /** Timestamp (Date.now()) when this segment index was first recorded. */
  ts: number;
}

export default function Map({
  circuit,
  Position,  // kept in props for API compat, not used for positioning
  DriverList,
  TimingData,
  TrackStatus,
  WindDirection,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<any>(null);
  const [[minX, minY, widthX, widthY], setBounds] = useState<any>([
    undefined, undefined, undefined, undefined,
  ]);
  const [stroke, setStroke] = useState(0);

  // Refs — stable across renders, updated synchronously
  const strokeRef = useRef(stroke);
  const timingRef = useRef(TimingData);
  const arcTable = useRef<ArcTable | null>(null);
  const trackPts = useRef<[number, number][]>([]);
  const segState = useRef<Record<string, DriverSegState>>({});

  // SVG element refs for direct DOM position updates
  const circleRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const textRefs = useRef<Record<string, SVGTextElement | null>>({});
  const rafId = useRef<number>(0);

  // Keep refs in sync with latest props/state
  useEffect(() => { strokeRef.current = stroke; }, [stroke]);
  useEffect(() => { timingRef.current = TimingData; }, [TimingData]);

  // ---------------------------------------------------------------------------
  // Load track geometry
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      const rawData = await multViewerService.getTrack(circuit);
      if (!rawData) return;

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
          (rawData.transformedPoints[3][1] - rawData.transformedPoints[0][1]) /
            (rawData.transformedPoints[3][0] - rawData.transformedPoints[0][0])
        )
      );

      // Build arc-length table once
      trackPts.current = rawData.transformedPoints;
      arcTable.current = buildArcTable(rawData.transformedPoints);

      // Reset per-driver state when circuit changes
      segState.current = {};

      setData(rawData);
    };

    fetchData();
  }, [circuit]);

  // ---------------------------------------------------------------------------
  // RAF animation loop — runs at ~60fps, updates SVG positions via DOM directly
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!data) return;

    const animate = () => {
      const timing = timingRef.current;
      const table = arcTable.current;
      const pts = trackPts.current;
      const sk = strokeRef.current;

      if (timing?.Lines && table && pts.length > 1) {
        const now = Date.now();

        for (const [rn, line] of Object.entries(timing.Lines) as [string, any][]) {
          const circle = circleRefs.current[rn];
          const text = textRefs.current[rn];
          if (!circle && !text) continue;

          const info = getSegmentInfo(line);
          if (!info) continue;

          // Update segment state when the driver advances to a new segment
          const prev = segState.current[rn];
          if (
            !prev ||
            prev.index !== info.index ||
            prev.total !== info.total
          ) {
            segState.current[rn] = {
              index: info.index,
              total: info.total,
              ts: now,
            };
          }

          const seg = segState.current[rn];

          // Estimate how long each minisegment takes based on the driver's
          // last lap time. Falls back to 90 s / total if no lap time yet.
          const lapMs = lapTimeToMs(line?.LastLapTime?.Value) ?? 90_000;
          const segDur = lapMs / seg.total;

          // How far through the current segment are we? (0 → 0.95 to never
          // overshoot into the next segment before data confirms it)
          const withinSeg = Math.min((now - seg.ts) / segDur, 0.95);

          // Map to 0..1 track fraction
          const fraction = (seg.index + withinSeg) / seg.total;

          const [x, y] = pointAtFraction(fraction, pts, table);

          if (circle) {
            circle.setAttribute("cx", String(x));
            circle.setAttribute("cy", String(y));
          }
          if (text) {
            text.setAttribute("x", String(x + sk * 2));
            text.setAttribute("y", String(y + sk));
          }
        }
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [data]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const mapContainerClasses = expanded
    ? "bg-slate-950 p-1 fixed top-[1rem] bottom-[1rem] left-[1rem] right-[1rem] border border-gray-300 rounded select-none shadow-[0_0_0_1000px_rgba(0,0,0,0.25)]"
    : "bg-slate-950 p-1 relative border-none rounded select-none";

  if (!data) return null;

  return (
    <div className={mapContainerClasses}>
      {/* Overlaid labels */}
      <div className="text-xs">
        <div
          className="flex"
          style={{ position: "absolute", top: "1rem", left: "1rem" }}
        >
          Status:&nbsp;
          <p style={{ color: getTrackStatusColor(TrackStatus.Status) }}>
            {TrackStatus.Message}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "calc(1rem + 20px)",
            left: "1rem",
          }}
        >
          N
          <CircleArrowUp
            size={20}
            style={{
              display: "inline-block",
              marginLeft: "0.5rem",
              transform: `rotate(${-data.rotation % 360}deg)`,
            }}
          />
        </div>
        <div
          style={{
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
              transform: `rotate(${(WindDirection - data.rotation) % 360}deg)`,
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

      {/* Track SVG */}
      <svg
        viewBox={`${minX} ${minY} ${widthX} ${widthY}`}
        width="100%"
        height={expanded ? "100%" : "500px"}
      >
        {/* Track outline */}
        <path
          stroke={getTrackStatusColor(TrackStatus.Status)}
          strokeWidth={stroke}
          strokeLinejoin="round"
          fill="transparent"
          d={`M${data.transformedPoints[0][0]},${
            data.transformedPoints[0][1]
          } ${data.transformedPoints.map(([x, y]: any) => `L${x},${y}`).join(" ")}`}
        />

        {/* Start / finish box */}
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

        {/* Driver dots — position updated every frame via RAF / direct DOM */}
        {TimingData &&
          Object.entries(TimingData.Lines)
            .sort(sortDriverPosition(TimingData.Lines))
            .map(([rn, line]: [string, any]) => {
              const driver = DriverList?.[rn];
              const out =
                line?.KnockedOut || line?.Retired || line?.Stopped;
              if (!driver || out) return null;

              const onTrack = !line?.InPit;
              const color = driver?.TeamColour
                ? `#${driver.TeamColour}`
                : "grey";
              const fontSize = stroke * 2.5;

              return (
                <g
                  key={`pos-${rn}`}
                  opacity={onTrack ? 1 : 0.3}
                >
                  <circle
                    ref={(el) => {
                      circleRefs.current[rn] = el;
                    }}
                    // cx/cy start at 0,0; RAF moves them immediately
                    cx={0}
                    cy={0}
                    r={stroke * (onTrack ? 1.25 : 0.6)}
                    fill={color}
                    stroke="black"
                    strokeWidth={fontSize / 20}
                  />
                  <text
                    ref={(el) => {
                      textRefs.current[rn] = el;
                    }}
                    x={0}
                    y={0}
                    fill={color}
                    fontSize={onTrack ? fontSize : fontSize * 0.75}
                  >
                    {driver.Tla}
                  </text>
                </g>
              );
            })}

        {/* Corner numbers */}
        {data.corners.map((corner: any) => {
          let label = `${corner.number}`;
          if (corner.letter) label += corner.letter;

          const fontSize = stroke * 1.8;
          const [cornerX, cornerY] = corner.transformedCorner;
          const [labelX, labelY] = corner.transformedLabel;
          const lineX = labelX + fontSize * (label.length * 0.25);
          const lineY =
            labelY - (labelY > cornerY ? fontSize * 0.7 : 0);

          return (
            <g key={`corner-${corner.number}`}>
              <text
                x={labelX}
                y={labelY}
                fontSize={fontSize}
                fontWeight="bold"
                fill="dimgrey"
                strokeWidth={fontSize / 40}
              >
                {label}
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
  );
}
