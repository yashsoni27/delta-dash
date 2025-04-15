import { BarTooltipProps, ResponsiveBar } from "@nivo/bar";
import { chartTheme } from "./StandingEvolution";

interface StackedBarChartProps {
  heading?: string;
  data: any;
  keys?: string[];
  indexBy?: string;
  layout?: "vertical" | "horizontal";
  groupMode?: "grouped" | "stacked";
  margin?: { top: number; right: number; bottom: number; left: number };
}

const CustomTooltip = ({
  id,
  value,
  color,
  indexValue,
  data,
}: BarTooltipProps) => (
  <div className="bg-slate-800 text-xs p-3 rounded-lg w-36 flex flex-col gap-2 opacity-95">
    <div>{data.name}</div>

    <div className="text-xs py-2 flex justify-between">
      <div>{id}</div>
      <div style={{ color }}>{value}</div>
    </div>
  </div>
);

export default function StackedBarChart({
  heading,
  data,
  keys,
  indexBy,
  layout = "vertical",
  groupMode = "stacked",
  margin = { top: 20, right: 20, bottom: 40, left: 30 },
}: StackedBarChartProps) {
  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
      <ResponsiveBar
        data={data}
        theme={chartTheme}
        colors={["#ffd54f", "#1a73e8", "#d1d1d1", "#e10600", "#6c2530"]}
        keys={keys}
        tooltip={CustomTooltip}
        indexBy={indexBy}
        margin={margin}
        padding={0.05}
        layout={layout}
        groupMode={groupMode}
        enableLabel={false}
        isInteractive={true}
        axisBottom={{
          tickRotation: -45,
        }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "top-right",
            direction: "column",
            itemWidth: 100,
            itemHeight: 20,
            symbolSize: 12,
            toggleSerie: true
          },
        ]}
        enableGridX={false}
        enableGridY={true}
        animate={true}
      />
    </>
  );
}
