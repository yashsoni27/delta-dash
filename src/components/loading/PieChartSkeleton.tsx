export default function PieChartSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gray-700 rounded-md w-1/4"></div>
      </div>
      <div className="flex justify-center items-center">
        <div 
          className="rounded-full bg-gray-700"
          style={{ width: '200px', height: '200px' }}
        ></div>
      </div>
    </div>
  );
}