import ChartSkeleton from "../loading/ChartSkeleton";
import { lightenColor } from "@/lib/utils";
import { chartTheme } from "./StandingEvolution";
import { ResponsiveRadar } from "@nivo/radar";

function createComparisonData(stats: any) {
  const driver1Name = stats.driver1.familyName;
  const driver2Name = stats.driver2.familyName;

  return [
    {
      label: "Best Race Finish",
      [driver1Name]: stats.driver1.bestFinish,
      [driver2Name]: stats.driver2.bestFinish,
    },
    {
      label: "Race",
      [driver1Name]: stats.driver1.raceWins,
      [driver2Name]: stats.driver2.raceWins,
    },
    {
      label: "Qualifying",
      [driver1Name]: stats.driver1.qualifyingWins,
      [driver2Name]: stats.driver2.qualifyingWins,
    },
    {
      label: "Poles",
      [driver1Name]: stats.driver1.poles,
      [driver2Name]: stats.driver2.poles,
    },
    {
      label: "DNF",
      [driver1Name]: stats.driver1.dnf,
      [driver2Name]: stats.driver2.dnf,
    },
    {
      label: "Best Qualifying",
      [driver1Name]: stats.driver1.bestGrid,
      [driver2Name]: stats.driver2.bestGrid,
    },
    {
      label: "Podiums",
      [driver1Name]: stats.driver1.podiums,
      [driver2Name]: stats.driver2.podiums,
    },
    {
      label: "Wins",
      [driver1Name]: stats.driver1.wins,
      [driver2Name]: stats.driver2.wins,
    },
  ];
}

export default function ComparisonChart({
  data,
  margin = { top: 30, right: 30, bottom: 30, left: 30 },
}: any) {
  if (data == undefined) {
    return <ChartSkeleton />;
  }

  const comparisonData = createComparisonData(data);
  const driverNames = [data.driver1.familyName, data.driver2.familyName];

  return (
    <>
      <div className="h-[600px] w-full">
        <ResponsiveRadar
          data={comparisonData}
          theme={chartTheme}
          keys={driverNames}
          indexBy={"label"}
          margin={margin}
          // colors={[data.color, lightenColor(data.color, 0.6)]}
          colors={[lightenColor(data.color, 0.6), data.color]}
          fillOpacity={0.5}
          gridLevels={6}
          gridShape="linear"
          blendMode="normal"
          borderWidth={2}
          dotSize={10}
          dotBorderWidth={2}
          enableDotLabel={false}
          isInteractive={true}
          sliceTooltip={({ data, index }) => {
            return (
              <div className="bg-slate-800 rounded-lg shadow-lg min-w-32 max-w-48 opacity-95">
                <div className="text-sm p-2 border-1 border-b border-slate-600">
                  {index}
                </div>
                <div className="p-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-gray-400">
                      {data[0]?.id}:
                    </span>
                    <span
                      className="text-sm font-semibold text-white"
                      style={{ color: data[0]?.color }}
                    >
                      {data[0].value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-gray-400">
                      {data[1]?.id}:
                    </span>
                    <span
                      className="text-sm font-semibold text-white"
                      style={{ color: data[1]?.color }}
                    >
                      {data[1].value}
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
    </>
  );
}
