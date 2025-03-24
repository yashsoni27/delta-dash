import { getConstructorHex } from "@/lib/utils";
import { ResponsiveBump } from "@nivo/bump";

interface driverEvo {
  code: string;
  driverId: string;
  constructorId: string;
  name: string;
  nationality: string;
  rounds: {
    rounds: number;
    position: number;
    points: number;
  }[];
}

interface constructorEvo {
  constructorId: string;
  name: string;
  nationality: string;
  rounds: {
    rounds: number;
    position: number;
    points: number;
  }[];
}

interface Evolutions {
  season: string;
  totalRounds: number;
  driversEvolution?: driverEvo[];
  constructorsEvolution?: constructorEvo[];
}

interface RankingEvolutionProps {
  title: string;
  standings: Evolutions;
}

function transformData(standings: Evolutions) {
  const transformedData = [];

  if (standings.driversEvolution) {
    for (const driver of standings.driversEvolution) {
      const driverSeries: {
        id: string;
        data: { x: string; y: number }[];
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
          x: `${i + 1}`,
          y: driver.rounds[i].position,
        });
      }

      transformedData.push(driverSeries);
    }
  }

  if (standings.constructorsEvolution) {
    for (const constructor of standings.constructorsEvolution) {
      const constructorSeries: {
        id: string;
        data: { x: string; y: number }[];
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
          x: `${i + 1}`,
          y: constructor.rounds[i].position,
        });
      }

      transformedData.push(constructorSeries);
    }
  }

  return transformedData;
}

const RankingEvolution = ({ title, standings }: RankingEvolutionProps) => {
  const data = transformData(standings);
  // console.log(data);

  const getColor = (series: { constructorId: string }) => {
    return getConstructorHex(series.constructorId);
  };

  const CustomTooltip = ({ point }: any) => {
    // const constructorColor = getColor(point);

    return (
      <div
        className="bg-slate-800 space-y-2"
        style={{
          fontSize: "10px",
          padding: "12px",
          borderRadius: "4px",
          // color: point.color, // Set the font color based on constructor
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
            ? { top: 0, right: 40, bottom: 20, left: 20 }
            : { top: 0, right: 90, bottom: 20, left: 20 }
        }
        // margin={{ top: 0, right: 90, bottom: 20, left: 20 }}
        endLabelPadding={10}
        xPadding={0.3}
        interpolation="smooth"
        axisTop={null}
        axisRight={null}
        activeLineWidth={6}
        colors={getColor}
        useMesh={true}
        animate={true}
        enableGridY={false}
        pointTooltip={CustomTooltip}
      />
    </>
  );
};

export default RankingEvolution;
