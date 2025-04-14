import React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Bar } from "@nivo/bar";
import { chartTheme } from "./StandingEvolution";

interface BarChartProps {
  heading?: string;
  height: number;
  width: number;
  data: any;
  keys?: string[];
  indexBy?: string;
  layout?: "vertical" | "horizontal";
  margin?: { top: number; right: number; bottom: number; left: number };
}

export default function BarChart({
  heading,
  height,
  width,
  data,
  keys,
  indexBy,
  layout = "vertical",
  margin = { top: 20, right: 60, bottom: 30, left: 60 },
}: BarChartProps) {
  // console.log(heading, data);
  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
      <Bar
        data={data}
        height={height}
        width={width}
        theme={chartTheme}
        colors={(bar) => String(bar.data["color"] || "#1f2941")}
        keys={keys}
        indexBy={indexBy}
        margin={margin}
        padding={0.05}
        enableTotals={true}
        enableLabel={false}
        isInteractive={false}
        layout={layout}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        // axisLeft={null}
        indexScale={{ type: "band", round: true }}
        enableGridX={false}
        enableGridY={false}
        animate={true}
      />
    </>
  );
}
