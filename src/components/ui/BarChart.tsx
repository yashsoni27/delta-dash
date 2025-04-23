import { Bar } from "@nivo/bar";
import { chartTheme } from "./StandingEvolution";
import { useEffect, useRef, useState } from "react";

interface BarChartProps {
  heading?: string;
  height?: number;
  width?: number;
  data: any;
  driver?: string;
  keys?: string[];
  indexBy?: string;
  padding?: number;
  enableGridX?: boolean;
  enableGridY?: boolean;
  enableLabel?: boolean;
  enableTotals?: boolean;
  isInteractive?: boolean;
  pitStopTooltip?: boolean;
  showAxisBottom?: boolean;
  showAxisLeft?: boolean;
  layout?: "vertical" | "horizontal";
  groupMode?: "grouped" | "stacked";
  margin?: { top: number; right: number; bottom: number; left: number };
}

export default function BarChart({
  heading,
  height,
  width,
  data,
  driver,
  keys,
  indexBy,
  padding = 0.05,
  enableGridX = false,
  enableGridY = false,
  enableLabel = false,
  enableTotals = true,
  isInteractive = false,
  pitStopTooltip = false,
  showAxisBottom = false,
  showAxisLeft = false,
  layout = "vertical",
  groupMode = "stacked",
  margin = { top: 20, right: 60, bottom: 30, left: 60 },
}: BarChartProps) {
  if (data == undefined) {
    return null;
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    setContainerDimensions({
      width: container.offsetWidth,
      height: container.offsetHeight,
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  interface BarTooltipProps {
    id: string | number;
    value: string | number;
    indexValue: string | number;
    data: any;
  }

  const CustomTooltip = ({ value, indexValue, data }: BarTooltipProps) => {
    return (
      <div className="bg-slate-800 text-xs rounded-md min-w-32 max-w-48 flex flex-col opacity-95">
        <div className="p-2 border-1 border-b border-slate-600">{driver}</div>

        <div className="p-2 text-xs flex justify-between gap-3">
          <div>{data.locality || indexValue}</div>
          <div className="font-bold">
            {value}{" "}
            {data.locality ? (value == "1" ? "lap led" : "laps led") : ""}
          </div>
        </div>
      </div>
    );
  };

  const PitStopToolTip = ({ id, value, indexValue, data }: BarTooltipProps) => {
    return (
      <div className="bg-slate-800 text-xs rounded-md min-w-32 max-w-48 flex flex-col opacity-95">
        <div className="p-2 border-1 border-b border-slate-600">
          {indexValue}
        </div>

        <div className="p-2 text-xs flex justify-between gap-3">
          {data.pitStopCount ? (
            <div>{data.pitStopCount} pit stops</div>
          ) : (
            <div>{id}</div>
          )}
          <div className="font-bold" style={{ color: data.color }}>
            {value} s avg
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
      <div ref={containerRef} className="w-full h-[400px]">
        <Bar
          data={data}
          height={height || containerDimensions.height}
          width={width || containerDimensions.width}
          theme={chartTheme}
          colors={(bar) => String(bar.data["color"] || "#1f2941")}
          tooltip={pitStopTooltip == true ? PitStopToolTip : CustomTooltip}
          keys={keys}
          indexBy={indexBy}
          valueFormat={(value) => {
            const num = Number(value);
            return Number.isInteger(num) ? num.toString() : num.toFixed(2);
          }}          
          margin={margin}
          padding={padding}
          innerPadding={1}
          enableLabel={enableLabel}
          labelSkipHeight={20}
          labelPosition="end"
          labelOffset={-15}
          enableTotals={enableTotals}
          layout={layout}
          groupMode={groupMode}
          axisTop={null}
          axisRight={null}
          axisBottom={showAxisBottom ? {} : null}
          axisLeft={showAxisLeft ? {} : null}
          indexScale={{ type: "band", round: true }}
          enableGridX={enableGridX}
          enableGridY={enableGridY}
          isInteractive={isInteractive}
          animate={true}
        />
      </div>
    </>
  );
}
