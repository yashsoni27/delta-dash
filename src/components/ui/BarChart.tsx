import { Bar } from "@nivo/bar";
import { chartTheme } from "./StandingEvolution";

interface BarChartProps {
  heading?: string;
  height: number;
  width: number;
  data: any;
  driver?: string;
  keys?: string[];
  indexBy?: string;
  enableGridX?: boolean;
  enableGridY?: boolean;
  enableLabel?: boolean;
  enableTotals?: boolean;
  isInteractive?: boolean;
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
  enableGridX = false,
  enableGridY = false,
  enableLabel = false,
  enableTotals = true,
  isInteractive = false,
  showAxisBottom = false,
  showAxisLeft = false,
  layout = "vertical",
  groupMode = "stacked",
  margin = { top: 20, right: 60, bottom: 30, left: 60 },
}: BarChartProps) {
  if (data == undefined) {
    return null;
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

  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
      <Bar
        data={data}
        height={height}
        width={width}
        theme={chartTheme}
        colors={(bar) => String(bar.data["color"] || "#1f2941")}
        tooltip={CustomTooltip}
        keys={keys}
        indexBy={indexBy}
        margin={margin}
        padding={0.05}
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
    </>
  );
}
