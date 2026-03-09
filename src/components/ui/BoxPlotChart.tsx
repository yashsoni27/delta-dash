import { getConstructorHex } from "@/lib/utils";
import { ResponsiveBoxPlot } from "@nivo/boxplot";
import { chartTheme as baseChartTheme } from "./StandingEvolution";

const chartTheme = {
  ...baseChartTheme,
  translation: {},
};

function transformData(data: any) {
  // const allValues = data.map((item: any) => item.time);
  const times = data.map((d: any) => d.time).sort((a: number, b: number) => a - b);

  // Calculate quartiles
  const q1 = times[Math.floor(times.length * 0.25)];
  const q3 = times[Math.floor(times.length * 0.75)];
  const iqr = q3 - q1;

  // Define outlier thresholds (typically 1.5 * IQR)
  const min = q1 - 1.5 * iqr;
  const max = q3 + 1.5 * iqr;

  const filtered = data.filter((d: any) => d.time >= min && d.time <= max);

  // group laps by driver
  const groups = Object.groupBy(filtered, (d: any) => d.driverCode);

  // sort drivers by median lap time
  const orderedDrivers = Object.entries(groups)
    .map(([driver, laps]: any) => {
      const sorted = laps.map((l: any) => l.time).sort((a: number, b: number) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      return { driver, median };
    })
    .sort((a, b) => a.median - b.median)
    .map((d) => d.driver);


  return orderedDrivers.flatMap((driver) =>
    (groups[driver] ?? []).map((lap: any) => ({
      group: lap.driverCode,
      value: lap.time,
      color: getConstructorHex(lap.constructorId),
    }))
  );

}

export default function BoxPlotChart({ data, heading }: any) {
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

  const getColor = (series: { group: string }) => {
    const entry = formattedData.find((d: any) => d.group === series.group);
    return entry?.color || "#999";
  };

  const CustomTooltip = ({ slice }: { slice: any }) => {
    if (!slice) return null;

    const color = slice.color || "#999";
    const { group, n, mean, extrema, quantiles, values } = slice.data || {};

    return (
      <div
        className="bg-slate-800 rounded-md min-w-[150px] opacity-95 text-xs"
        style={{
          fontSize: "10px",
          fontWeight: "light",
        }}
      >
        <div className="flex items-center justify-between mb-2 border-b border-slate-700 p-2">
          <div className="flex items-center">
            <div
              className="w-3 h-3 mr-2 rounded-sm"
              style={{ backgroundColor: color }}
            ></div>
            <div className="text-sm">{group || "Data"}</div>
          </div>
          <div className="text-xs text-slate-400">{n ?? "N/A"} Laps</div>
        </div>

        <div className="flex py-2 px-3">
          <div className="mr-4 mb-1">
            <div className="flex justify-between gap-2 text-green-600">
              <span>Best:</span>{" "}
              <span className="ml-2">{extrema?.[0].toFixed(2) ?? "N/A"}</span>
            </div>
            <div className="flex justify-between gap-2 text-orange-600">
              <span>Average: </span>
              <span className="">{mean?.toFixed(2) ?? "N/A"}</span>
            </div>
            <div className="flex justify-between gap-2 text-red-600">
              <span>Worst: </span>
              <span className="">{extrema?.[1].toFixed(2) ?? "N/A"}</span>
            </div>
          </div>

          <div className="mb-1 ml-1">
            {values?.map((value: number, index: number) => (
              <div key={index}>
                {Number(quantiles?.[index] * 100) ?? "?"}%:{" "}
                <span className="">
                  {value?.toFixed(2) ?? "N/A"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
      <ResponsiveBoxPlot
        data={formattedData}
        margin={{ top: 10, right: 40, bottom: 30, left: 35 }}
        axisTop={null}
        axisRight={null}
        theme={chartTheme}
        // groupBy="group"
        // colorBy="group"
        tooltip={(slice) => <CustomTooltip slice={slice} />}
        axisBottom={{
          tickRotation: -40,
        }}
        colors={getColor}
        enableGridX={false}
        whiskerWidth={1}
        whiskerEndSize={0.6}
        medianWidth={1}
        borderRadius={5}
        enableGridY={true}
        animate={true}
      />
    </>
  );
}
