export default function CountdownCardSkeleton() {
  return (
    <div className="bg-gradient-to-tr from-red-900 to-red-700 p-5 rounded-lg shadow-lg border border-red-600 min-w-max max-w-md text-center">
      <div className="h-7 w-2/3 bg-red-600/50 rounded animate-pulse mb-4"></div>

      <div className="flex justify-between items-center">
        <div className="flex justify-start align-middle space-x-2 md:space-x-4 text-xl">
          {[...Array(4)].map((_, index) => (
            <div key={index}>
              <div className="h-8 w-8 bg-red-600/50 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-8 bg-red-600/50 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="md:mr-5 h-20 w-24 bg-red-600/50 rounded animate-pulse"></div>
      </div>
    </div>
  );
}