export default function CardSkeleton() {
  return (
    <div className="rounded-lg shadow-lg overflow-hidden flex flex-col justify-around max-w-md p-5 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <div className="h-6 bg-gray-700 rounded-md w-1/3 animate-pulse"></div>
        <div className="h-6 w-6 bg-gray-700 rounded-full animate-pulse"></div>
      </div>
      <div className="flex flex-col">
        <div className="h-8 bg-gray-700 rounded-md w-2/3 mb-1 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded-md w-1/2 animate-pulse"></div>
      </div>
    </div>
  )
}
