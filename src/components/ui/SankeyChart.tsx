import { ResponsiveSankey } from "@nivo/sankey";

interface SankeyChartProps {
  heading: string;
  data: any;
  driver: string;
  margin?: { top: number; right: number; bottom: number; left: number };
}

interface SankeyData {
  start: number;
  finish: number;
}

function transformData(data: SankeyData[]) {
  // Extract distinct start and finish node labels
  const startNodes = data.map(({ start }) => `Start P${start}`);
  const finishNodes = data.map(({ finish }) => `Finish P${finish}`);
  const nodeIds = Array.from(new Set([...startNodes, ...finishNodes]));

  // Assign colors using HSL
  const nodes = nodeIds.map((id, index) => ({
    id,
  }));

  const linkMap = new Map();

  // Build and combine links
  data.forEach(({ start, finish }) => {
    const source = `Start P${start}`;
    const target = `Finish P${finish}`;
    const key = `${source}->${target}`;

    if (linkMap.has(key)) {
      const existingLink = linkMap.get(key);
      existingLink.value += 1;
    } else {
      linkMap.set(key, {
        source,
        target,
        value: 1,
      });
    }
  });

  // Convert map values to array
  const links = Array.from(linkMap.values());

  const graphData = { nodes, links };

  return graphData;
}

export default function SankeyChart({
  heading,
  data,
  driver,
  margin = { top: 10, right: 30, bottom: 20, left: 30 },
}: SankeyChartProps) {
  if (data == undefined) {
    return null;
  }
  const chartData = transformData(data);
  const nodeCount = chartData.nodes.length;
  const linkCount = chartData.links.length;

  const height = Math.max(300, nodeCount * 60);

  const CustomNodeTooltip = ({ node }: { node: any }) => {
    return (
      <div className="bg-slate-800 opacity-95 text-xs text-white rounded-md w-40">
        <div className="p-2 border-b border-1 border-slate-600">{driver}</div>
        <div className="flex p-2 justify-between">
          <div>{node.id}</div>
          <div style={{ color: node.color }}>{node.value}</div>
        </div>
      </div>
    );
  };

  const CustomLinkTooltip = ({ link }: { link: any }) => {
    return (
      <div className="bg-slate-800 opacity-95 text-xs text-white rounded-md w-52">
        <div className="p-2 border-b border-1 border-slate-600">{driver}</div>
        <div className="flex p-2 justify-between">
          <div>
            <span style={{ color: link.source.color }}>{link.source.id}</span>{" "}
            to{" "}
            <span style={{ color: link.target.color }}>{link.target.id}</span>
          </div>
          {link.value === 1 ? (
            <div>{link.value} race</div>
          ) : (
            <div>{link.value} races</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="scroll-m-20 mb-3">{heading}</div>
      <div style={{ height: height }}>
        <ResponsiveSankey
          data={chartData}
          margin={margin}
          colors={{ scheme: "set1" }}
          nodeTooltip={CustomNodeTooltip}
          linkTooltip={CustomLinkTooltip}
          nodeOpacity={1}
          nodeSpacing={20}
          nodeThickness={14}
          nodeBorderWidth={0}
          nodeBorderRadius={4}
          linkOpacity={0.5}
          linkHoverOthersOpacity={0.1}
          linkContract={2}
          linkBlendMode="difference"
          labelPosition="outside"
          enableLinkGradient={true}
          labelOrientation="vertical"
        />
      </div>
    </>
  );
}
