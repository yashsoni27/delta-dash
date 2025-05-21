import { BarTooltipProps, ResponsiveBar } from "@nivo/bar";
import { chartTheme } from "./StandingEvolution";
import ChartSkeleton from "../loading/ChartSkeleton";

interface StackedBarChartProps {
  heading?: string;
  data: any;
  colors?: string[];
  keys?: string[];
  indexBy?: string;
  layout?: "vertical" | "horizontal";
  groupMode?: "grouped" | "stacked";
  margin?: { top: number; right: number; bottom: number; left: number };
  minValue?: number;
  maxValue?: number;
}

const CustomTooltip = ({
  id,
  value,
  color,
  indexValue,
  data,
}: BarTooltipProps<any>) => (
  <div className="bg-slate-800 text-xs rounded-md w-36 flex flex-col opacity-95">
    <div className="p-2 border-b border-slate-600">{data.name}</div>

    <div className="p-2 flex justify-between">
      <div>{id}</div>
      <div>{value}</div>
    </div>
  </div>
);

export default function StackedBarChart({
  heading,
  data,
  colors = ["#ffd54f", "#1a73e8", "#d1d1d1", "#e10600", "#6c2530"],
  keys,
  indexBy,
  layout = "vertical",
  groupMode = "stacked",
  margin = { top: 20, right: 20, bottom: 40, left: 30 },
  minValue,
  maxValue,
}: StackedBarChartProps) {
  if (data == null) {
    return <ChartSkeleton />;
  }
  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
      <ResponsiveBar
        data={data}
        theme={chartTheme}
        colors={colors}
        keys={keys}
        tooltip={CustomTooltip}
        indexBy={indexBy}
        margin={margin}
        padding={0.1}
        {...(minValue && maxValue
          ? {
              valueScale: {
                type: "linear",
                min: minValue,
                max: maxValue,
                clamp: true,
              },
            }
          : {})}
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
            itemWidth: 80,
            itemHeight: 20,
            symbolSize: 12,
            toggleSerie: true,
          },
        ]}
        enableGridX={false}
        enableGridY={true}
        animate={true}
      />
    </>
  );
}
