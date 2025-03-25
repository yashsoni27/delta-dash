import { getConstructorHex } from "@/lib/utils";
import { Evolutions, RankingEvolutionProps } from "@/types";
import { ResponsiveBump } from "@nivo/bump";
import { chartTheme } from "./StandingEvolution";

function transformData(rankings: Evolutions) {
  const transformedData = [];

  if (rankings.driversEvolution) {
    for (const driver of rankings.driversEvolution) {
      const driverSeries: {
        id: string;
        data: { x: string | number; y: number | null }[];
        name: string;
        constructorId: string;
      } = {
        id: driver.code,
        data: [],
        name: driver.name,
        constructorId: driver.constructorId,
      };

      for (let i = 0; i < driver.rounds.length; i++) {
        driverSeries.data.push({
          x: i + 1 == driver.rounds[i].round ? i + 1 : driver.rounds[i].round,
          y: driver.rounds[i].position,
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
        name: string;
      } = {
        id: constructor.name,
        name: constructor.name,
        data: [],
        constructorId: constructor.constructorId,
      };

      for (let i = 0; i < constructor.rounds.length; i++) {
        constructorSeries.data.push({
          x: constructor.rounds[i].round,
          y: constructor.rounds[i].position,
        });
      }

      transformedData.push(constructorSeries);
    }
  }

  return transformedData;
}

const RankingEvolution = ({ title, rankings }: RankingEvolutionProps) => {
  const data = transformData(rankings);

  const getColor = (series: { constructorId: string }) => {
    return getConstructorHex(series.constructorId);
  };

  const CustomTooltip = ({ point }: any) => {
    return (
      <div
        className="bg-slate-800 space-y-2"
        style={{
          fontSize: "10px",
          padding: "12px",
          borderRadius: "4px",
          fontWeight: "light",
        }}
      >
        <div className="">{point.serie.data.name}</div>
        <div className="inline-flex space-x-3 content-center">
          <div>{point.data.x} </div>
          <div style={{ color: point.color }}>
            {point.data.y}
            <sup>th</sup> pos
          </div>
        </div>
      </div>
    );
  };


  return (
    <>
      <div className="mb-3">{title} Ranking Evolution</div>
      <ResponsiveBump
        data={data}
        margin={
          title == "Drivers"
            ? { top: 0, right: 40, bottom: 20, left: 22 }
            : { top: 0, right: 90, bottom: 20, left: 22 }
        }
        endLabelPadding={10}
        xPadding={0.8}
        interpolation="smooth"
        pointSize={4}
        inactivePointSize={1}
        axisTop={null}
        axisRight={null}
        theme={chartTheme}
        // activeLineWidth={5}
        colors={getColor}
        useMesh={true}
        animate={true}
        motionConfig={"slow"}
        enableGridY={false}
        enableGridX={false}
        pointTooltip={CustomTooltip}
      />
    </>
  );
};

export default RankingEvolution;
