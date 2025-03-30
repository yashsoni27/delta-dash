import { getConstructorHex } from "@/lib/utils";
import { ResponsiveBoxPlot } from "@nivo/boxplot";
import { chartTheme as baseChartTheme } from "./StandingEvolution";

const chartTheme = {
  ...baseChartTheme,
  translation: {},
};

function transformData(data: any) {
  const allValues = data.map((item: any) => item.time);

  // Calculate quartiles
  const sorted = [...allValues].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;

  // Define outlier thresholds (typically 1.5 * IQR)
  const lowerThreshold = q1 - 1.5 * iqr;
  const upperThreshold = q3 + 1.5 * iqr;

  return data
    .filter((item: any) => {
      const value = item.time;
      return value >= lowerThreshold && value <= upperThreshold;
    })
    .map((item: any) => ({
      group: item.driverCode,
      value: item.time,
      color: getConstructorHex(item.constructorId),
    }));

  // return data.map((item: any) => ({
  //   // group: item.familyName,
  //   group: item.driverCode,
  //   value: item.time,
  //   color: getConstructorHex(item.constructorId),
  // }));
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
  // console.log("boxPlot", formattedData);

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
        className="bg-slate-950 p-4 rounded min-w-[150px] opacity-95 text-xs"
        style={{
          fontSize: "10px",
          fontWeight: "light",
        }}
      >
        <div className="flex items-center mb-2">
          <span
            className="w-3 h-3 mr-2 rounded-sm"
            style={{ backgroundColor: color }}
          ></span>
          <span className="font-semibold">{group || "Data"}</span>
        </div>

        <div className="flex">
          <div className="mr-4">
            <div className="mb-4">
              <span className="font-bold">n:</span> {n ?? "N/A"}
            </div>

            <div className="mb-1">
              <span className="font-normal">Summary</span>
              <div className="ml-1">
                <div>
                  mean:{" "}
                  <span className="font-semibold">
                    {mean?.toFixed(2) ?? "N/A"}
                  </span>
                </div>
                <div>
                  min:{" "}
                  <span className="font-semibold">
                    {extrema?.[0].toFixed(2) ?? "N/A"}
                  </span>
                </div>
                <div>
                  max:{" "}
                  <span className="font-semibold">
                    {extrema?.[1].toFixed(2) ?? "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <div className="mb-1">
              <span className="font-normal">Quantiles</span>
              <div className="ml-1">
                {values?.map((value: number, index: number) => (
                  <div key={index}>
                    {Number(quantiles?.[index] * 100) ?? "?"}%:{" "}
                    <span className="font-semibold">
                      {value?.toFixed(2) ?? "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
        groupBy="group"
        colorBy="group"
        tooltip={(slice) => <CustomTooltip slice={slice} />}
        axisBottom={{
          tickRotation: -40,
        }}
        colors={getColor}
        enableGridX={false}
        whiskerWidth={1}
        whiskerEndSize={0.5}
        medianWidth={2}
        borderRadius={2}
        enableGridY={true}
        animate={true}
        // useMesh={true}
      />
    </>
  );
}
