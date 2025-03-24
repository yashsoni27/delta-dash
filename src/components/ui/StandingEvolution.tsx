import { getConstructorColor, getConstructorHex } from "@/lib/utils";
import { Evolutions, StandingEvolutionProps } from "@/types";
import { ResponsiveLine } from "@nivo/line";

function transformData(rankings: Evolutions) {
  const transformedData = [];

  if (rankings.driversEvolution) {
    for (const driver of rankings.driversEvolution) {
      const driverSeries: {
        id: string;
        data: { x: string; y: number }[];
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
          x: `${i + 1}`,
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
        data: { x: string; y: number }[];
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
          x: `${i + 1}`,
          y: constructor.rounds[i].points,
        });
      }

      transformedData.push(constructorSeries);
    }
  }

  return transformedData;
}

const StandingEvolution = ({ title, standings }: StandingEvolutionProps) => {
  const data = transformData(standings);

  const getColor = (series: { constructorId: string }) => {
    return getConstructorHex(series.constructorId);
  };

  const CustomTooltip = ({ slice }: { slice: any }) => {
    const sortedPoints = slice.points
      .slice() // Create a copy to avoid mutating the original array
      .sort((a: any, b: any) => b.data.y - a.data.y);

    return (
      <div
        className="bg-slate-800"
        style={{
          fontSize: "10px",
          padding: "8px",
          borderRadius: "4px",
          fontWeight: "light",
          minWidth: "100px",
        }}
      >
        <div className="mb-2">{sortedPoints[0].data.x}</div>
        {sortedPoints.map((point: any) => {
          return (
            <div
              key={point.id}
              className="flex justify-between items-center mb-1"
              style={{color: point.serieColor}}
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
        margin={{ top: 0, right: 40, bottom: 20, left: 30 }}
        axisTop={null}
        axisRight={null}
        enablePoints={true}
        pointSize={5}
        // pointLabel="data.yFormatted"
        // colors={getColor}
        enableSlices="x"
        sliceTooltip={({ slice }) => <CustomTooltip slice={slice} />}
        colors={getColor}
        enableGridY={false}
        animate={true}
        useMesh={true}
      />
    </>
  );
};

export default StandingEvolution;
