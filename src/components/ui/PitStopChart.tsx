import { ResponsiveLine } from "@nivo/line";
import { chartTheme } from "./StandingEvolution";
import { DHLtoJolpicaConstructor, getConstructorHex } from "@/lib/utils";

function transformData(pitStopData: any) {
  const eventIds = [
    ...new Set(pitStopData.flatMap((team: any) => Object.keys(team.duration))),
  ].sort();
  const roundMap = Object.fromEntries(eventIds.map((id, index) => [id, index + 1]));
  
  const transformedData = pitStopData.map((team: any) => {
    const data = Object.entries(team.duration).map(([evtId, time]) => ({
      x: roundMap[evtId],
      y: typeof time === "number" ? Number(time.toFixed(3)) : null,
    }));

    return {
      id: team.team_name,
      data: data,
      color: getConstructorHex(DHLtoJolpicaConstructor(team.team_name)),
    };
  });

  return transformedData;
}

export default function PitStopChart({
  data,
  heading,
}: {
  data: any;
  heading: string;
}) {
  if (!data?.length) {
    return (
      <div className={`md:row-start-4 lg:row-start-3 rounded-lg pt-2`}>
        <div className="scroll-m-20 mb-3">{heading}</div>
        <div className="p-4 text-sm text-center text-gray-500">
          No pit stop data available
        </div>
      </div>
    );
  }

  const formattedData = transformData(data);
  // console.log("check", formattedData);

  const getColor = (series: { color: string }) => series.color;

  const CustomTooltip = ({ slice }: { slice: any }) => {
    if (!slice?.points?.length) return null;

    const sortedPoints = [...slice.points].sort((a, b) => b.data.y - a.data.y);
    const lapNumber = sortedPoints[0].data.x;
    // console.log(sortedPoints);
    return (
      <div
        className="bg-slate-800 p-2 rounded min-w-[130px] opacity-95"
        style={{
          fontSize: "10px",
          padding: "8px",
          fontWeight: "light",
        }}
      >
        <div className="mb-2">Round {lapNumber}</div>
        {sortedPoints.map((point) => (
          <div
            key={point.serieId}
            className="flex justify-between items-center mb-1"
            style={{ color: point.serieColor }}
          >
            <span className="pr-2">{point.serieId}</span>
            <span>{Number(point.data.y.toFixed(3))}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
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
        // xScale={{
        //   type: "linear",
        //   min: "auto",
        //   max: "auto",
        // }}
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
