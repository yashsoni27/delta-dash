import { ResponsiveRadialBar } from "@nivo/radial-bar";
import { chartTheme } from "./StandingEvolution";

interface RadialBarChartProps {
  heading?: string;
  data: any;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const colorMap: Record<string, string> = {
  Wins: "#ffd54f",
  Podiums: "#1a73e8",
  PointsFinish: "#d1d1d1",
  DNF: "#e10600",
  DSQ: "#6c2530",
};

export default function RadialBarChart({
  heading,
  data,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
}: RadialBarChartProps) {
  if (data == undefined) {
    return null;
  }

  const chartData = Object.keys(data)
    .filter((key) => key !== "TotalRounds")
    .map((key) => ({
      id: key,
      data: [{ x: key, y: data[key] }],
    }))
    .reverse();

  const getColor = (key: string) => {
    const stat = key.split(".")[1];
    return colorMap[stat];
  };

  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
      <div style={{ height: 300 }}>
        <ResponsiveRadialBar
          data={chartData}
          // maxValue={data["TotalRounds"]}
          theme={chartTheme}
          margin={margin}
          innerRadius={0.2}
          padding={0.2}
          cornerRadius={2}
          colors={({ id }) => getColor(String(id))}
          enableLabels={true}
          labelsTextColor="labels.text.fill"
          enableRadialGrid={false}
          enableCircularGrid={false}
          radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
          circularAxisOuter={null}
          isInteractive={false}
          tracksColor="#1c2534"
        />
      </div>
    </>
  );
}
