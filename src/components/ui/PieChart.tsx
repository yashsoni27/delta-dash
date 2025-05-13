import { ResponsivePie } from "@nivo/pie";
import { chartTheme } from "./StandingEvolution";
import { getConstructorColor, getConstructorHex } from "@/lib/utils";

interface PieChartProps {
  heading: string;
  data: any;
  color?: string;
  driver: string;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const CenteredMetric = ({
  dataWithArc,
  centerX,
  centerY,
}: {
  dataWithArc: ReadonlyArray<{ value: number }>;
  centerX: number;
  centerY: number;
}) => {
  const total = dataWithArc.reduce((sum, datum) => sum + datum.value, 0);
  const percentage = (dataWithArc[0].value / total) * 100;

  return (
    <text
      x={centerX}
      y={centerY}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: "1.5rem", fontWeight: "bold", fill: "white" }}
    >
      {`${Math.round(percentage)}%`}
    </text>
  );
};

export default function PieChart({
  heading,
  data,
  color,
  driver,
  margin = { top: 10, right: 10, bottom: 10, left: 10 },
}: PieChartProps) {
  if (data == undefined || null) {
    return null;
  }
  const chartData = [
    {
      id: "withPoints",
      label: "In Points",
      value: data.withPoints,
    },
    {
      id: "withoutPoints",
      label: "Not in Points",
      value: data.withoutPoints,
    },
  ];

  const chartColors = [
    getConstructorHex(color || "default"),
    getConstructorColor(color || "default"),
  ];

  const CustomTooltip = ({ datum }: { datum: any }) => {
    return (
      <div
        className="bg-slate-800 opacity-95 text-xs text-white rounded-md w-40"
      >
        <div className="p-2 border-b border-1 border-slate-500">{driver}</div>
        <div className="flex p-2 justify-between">
          <div>{datum.data.label}</div>
          <div>{datum.data.value}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
      <div style={{ height: 300 }}>
        <ResponsivePie
          data={chartData}
          colors={chartColors}
          theme={chartTheme}
          cornerRadius={2}
          innerRadius={0.5}
          margin={margin}
          padAngle={0}
          arcLabelsSkipAngle={10}
          enableArcLinkLabels={false}
          tooltip={CustomTooltip}
          isInteractive={true}
          activeOuterRadiusOffset={8}
          layers={[
            "arcs",
            "arcLabels",
            "arcLinkLabels",
            "legends",
            CenteredMetric,
          ]}
        />
      </div>
    </>
  );
}
