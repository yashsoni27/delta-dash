import { ResponsiveLine } from "@nivo/line";
import React from "react";
import { chartTheme } from "./StandingEvolution";
import { getConstructorHex } from "@/lib/utils";

function transformData(lapData: any) {
  const transformedData: any = [];
  
  const driverLaps: { [key: string]: any[] } = {};
  
  // Grouping laps by drivers
  Object.values(lapData).forEach((lap: any) => {
    if (!driverLaps[lap.driverId]) {
      driverLaps[lap.driverId] = [];
    }
    driverLaps[lap.driverId].push(lap);
  });
  
  // Transforming the data for each driver
  Object.entries(driverLaps).forEach(([driverId, laps]) => {
    const driverSeries = {
      id: laps[0].familyName,
      data: laps.map((lap: any) => ({
        x: lap.lapNumber,
        y: lap.time,
      })),
      color: getConstructorHex(laps[0].constructorId),
    };
    
    transformedData.push(driverSeries);
  });
  
  return transformedData;
}

export default function LapTimesChart({ data }: any) {

  if (!data) {
    return (
      <div
        className={`md:row-start-4 lg:row-start-3 rounded-lg pt-2`}
      >
        <div className="scroll-m-20 mb-3">Lap Times</div>
        <div className="p-4 text-sm text-center text-gray-500">No data available</div>
      </div>
    );
  }
  const formattedData = transformData(data);
  
  const getColor = (series: { color: string }) => {
    return series.color;
  };
  
  const CustomTooltip = ({ slice }: { slice: any }) => {
    if (!slice?.points?.length) return null;

    const sortedPoints = [...slice.points].sort((a, b) => b.data.y - a.data.y);
    const round = sortedPoints[0].data.x;

    return (
      <div
        className="bg-slate-800 p-2 rounded min-w-[100px] opacity-95"
        style={{
          fontSize: "10px",
          padding: "8px",
          fontWeight: "light",
        }}
      >
        <div className="mb-2">Lap {round}</div>
        {sortedPoints.map((point) => {
          return (
            <div
              key={point.serieId}
              className="flex justify-between items-center mb-1"
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
      <div className="scroll-m-20 mb-3">Lap Times</div>
      <ResponsiveLine
        data={formattedData}
        margin={{ top: 10, right: 40, bottom: 20, left: 30 }}
        axisTop={null}
        axisRight={null}
        theme={chartTheme}
        enablePoints={true}
        lineWidth={2}
        pointSize={4}
        yScale={{
          type: "linear",
          stacked: false,
          min: "auto",
          max: "auto",
        }}
        xScale={{
          type: "linear",
          min: "auto",
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
