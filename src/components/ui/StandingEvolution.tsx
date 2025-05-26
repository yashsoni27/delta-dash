import { getConstructorHex } from "@/lib/utils";
import { Evolutions, StandingEvolutionProps } from "@/types";
import { ResponsiveLine } from "@nivo/line";

function transformData(rankings: Evolutions) {
  const transformedData = [];

  if (rankings.driversEvolution) {
    for (const driver of rankings.driversEvolution) {
      const driverSeries: {
        id: string;
        data: { x: number | string; y: number }[];
        name: string;
        color: string;
        constructorId: string;
      } = {
        // id: driver.code,
        id: driver.name,
        data: [],
        name: driver.name,
        color: getConstructorHex(driver.constructorId),
        constructorId: driver.constructorId,
      };

      for (let i = 0; i < driver.rounds.length; i++) {
        driverSeries.data.push({
          x: driver.rounds[i].round,
          y: driver.rounds[i].points,
        });
      }

      transformedData.push(driverSeries);
    }
  }

  if (rankings.constructorsEvolution) {
    for (const constructor of rankings.constructorsEvolution) {
      const constructorSeries: {
        id: string;
        data: { x: string | number; y: number }[];
        constructorId: string;
        color: string;
        name: string;
      } = {
        id: constructor.name,
        name: constructor.name,
        data: [],
        constructorId: constructor.constructorId,
        color: constructor.constructorId,
      };

      for (let i = 0; i < constructor.rounds.length; i++) {
        constructorSeries.data.push({
          x: constructor.rounds[i].round,
          y: constructor.rounds[i].points,
        });
      }

      transformedData.push(constructorSeries);
    }
  }

  return transformedData;
}

export const chartTheme = {
  axis: {
    ticks: {
      text: {
        fill: "#94a3b8",
        fontSize: 11
      },
      line: {
        stroke: "rgba(255, 255, 255, 0.10)",
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fill: "#fff",
      },
    },
  },
  grid: {
    line: {
      stroke: "rgba(255, 255, 255, 0.10)",
      strokeWidth: 1,
      // strokeDasharray: '4 4' // Optional: creates a dashed line effect
    },
  },
  text: {
    fill: "#fff",
    fontSize: 11,
    fontWeight: 300,
  },
};

const StandingEvolution = ({ title, standings }: StandingEvolutionProps) => {
  const data = transformData(standings);

  const getColor = (series: { constructorId: string }) => {
    return getConstructorHex(series.constructorId);
  };

  const CustomTooltip = ({ slice }: { slice: any }) => {
    if (!slice?.points?.length) return null;
    const sortedPoints = [...slice.points].sort((a, b) => b.data.y - a.data.y);
    const round = sortedPoints[0].data.x;

    return (
      <div
        className="bg-slate-800 rounded-md min-w-[120px] opacity-95"
        style={{
          fontSize: "10px",
          fontWeight: "light",
        }}
      >
        <div className="mb-2 p-2 border-b border-slate-600">R{round}</div>
        {sortedPoints.map((point) => {
          return (
            <div
              key={point.serieId}
              className="flex justify-between items-center mb-1 px-2 last:pb-2"
              style={{ color: point.serieColor }}
            >
              <span className="pr-2">{point.serieId}</span>
              <span style={{ color: point.serieColor }}>{point.data.y}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="mb-3">{title} Standings Evolution</div>
      <ResponsiveLine
        data={data}
        margin={{ top: 10, right: 40, bottom: 20, left: 30 }}
        axisTop={null}
        axisRight={null}
        theme={chartTheme}
        enablePoints={true}
        lineWidth={2}
        pointSize={4}
        enableSlices="x"
        sliceTooltip={({ slice }) => <CustomTooltip slice={slice} />}
        colors={getColor}
        enableGridX={false}
        enableGridY={true}
        animate={true}
        motionConfig={"slow"}
        useMesh={true}
      />
    </>
  );
};

export default StandingEvolution;
