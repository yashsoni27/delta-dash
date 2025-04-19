export default function ChartSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div className="w-full animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gray-700 rounded-md w-1/4"></div>
      </div>
      <div 
        className="w-full bg-gray-700 rounded-lg"
        style={{ height: `${height}px` }}
      ></div>
    </div>
  );
}