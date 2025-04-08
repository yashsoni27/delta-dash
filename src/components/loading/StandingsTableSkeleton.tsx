export default function StandingsTableSkeleton() {
  return (
    <div className="md:row-start-4 lg:row-start-3 rounded-lg border border-gray-700 pt-2">
      <div className="p-4">
        <div className="h-7 bg-gray-700 rounded w-1/3 animate-pulse"></div>
      </div>
      <div className="aspect-[1/1]">
        <div className="relative w-full overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm">
                <th className="pb-3 w-1/6">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </th>
                <th className="pb-3 w-3/6">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </th>
                <th className="pb-3 w-1/6">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </th>
                <th className="pb-3 w-1/6">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, index) => (
                <tr key={index}>
                  <td className="py-3 border-t border-gray-700">
                    <div className="h-4 bg-gray-700 rounded animate-pulse mx-auto w-1/2"></div>
                  </td>
                  <td className="py-3 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3"></div>
                    </div>
                  </td>
                  <td className="py-3 border-t border-gray-700">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2 ml-auto"></div>
                  </td>
                  <td className="py-3 border-t border-gray-700">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-4 mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-[58px] border-t border-gray-700 flex items-center justify-center">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3"></div>
        </div>
      </div>
    </div>
  );
}
