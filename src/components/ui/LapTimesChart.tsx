import { ResponsiveLine } from "@nivo/line";
import { chartTheme } from "./StandingEvolution";
import { getConstructorHex } from "@/lib/utils";

function transformData(lapData: any) {
  const transformedData: any = [];
  const driverLaps: { [key: string]: any[] } = {};
  const allTimes: number[] = [];

  // Grouping laps by drivers
  Object.values(lapData).forEach((lap: any) => {
    allTimes.push(lap.time);
    if (!driverLaps[lap.driverId]) {
      driverLaps[lap.driverId] = [];
    }
    driverLaps[lap.driverId].push(lap);
  });

  // Calculate global quartiles for all lap times
  const sorted = [...allTimes].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;

  // Define global outlier thresholds
  const lowerThreshold = q1 - 1.5 * iqr;
  const upperThreshold = q3 + 1.5 * iqr;

  // Transforming the data for each driver
  Object.entries(driverLaps).forEach(([driverId, laps]) => {
    const filteredLaps = laps.filter(
      (lap) => lap.time >= lowerThreshold && lap.time <= upperThreshold
    );

    if (filteredLaps.length > 0) {
      const driverSeries = {
        id: filteredLaps[0].familyName,
        data: filteredLaps.map((lap: any) => ({
          x: lap.lapNumber,
          y: lap.time,
        })),
        color: getConstructorHex(filteredLaps[0].constructorId),
      };
      transformedData.push(driverSeries);
    }
  });

  return transformedData;
}

export default function LapTimesChart({ data, heading }: any) {
  if (!data) {
    return (
      <div className={`md:row-start-4 lg:row-start-3 rounded-lg pt-2`}>
        <div className="scroll-m-20 mb-3">{heading}</div>
        <div className="p-4 text-sm text-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }
  const formattedData = transformData(data);

  const getColor = (series: { color: string }) => {
    return series.color;
  };

  const CustomTooltip = ({ slice }: { slice: any }) => {
    if (!slice?.points?.length) return null;

    const sortedPoints = [...slice.points].sort((a, b) => a.data.y - b.data.y);
    const round = sortedPoints[0].data.x;

    return (
      <div
        className="bg-slate-800 rounded-md min-w-[120px] opacity-95"
        style={{
          fontSize: "10px",
          fontWeight: "light",
        }}
      >
        <div className="mb-2 p-2 border-b border-slate-600">Lap {round}</div>
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
      <div className="scroll-m-20 mb-3">{heading}</div>
      <ResponsiveLine
        data={formattedData}
        margin={{ top: 10, right: 20, bottom: 20, left: 40 }}
        axisTop={null}
        axisRight={null}
        theme={chartTheme}
        enablePoints={true}
        lineWidth={2}
        pointSize={4}
        // pointSymbol={function noRefCheck() {}}
        yScale={{
          type: "linear",
          stacked: false,
          min: "auto",
          max: "auto",
        }}
        xScale={{
          type: "linear",
          min: 1,
          max: "auto",
        }}
        enableSlices="x"
        sliceTooltip={({ slice }) => <CustomTooltip slice={slice} />}
        colors={getColor}
        enableGridX={false}
        enableGridY={true}
        animate={true}
        useMesh={true}
      />
    </>
  );
}
