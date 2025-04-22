import { TableProps } from "@/types";
import ChartSkeleton from "../loading/ChartSkeleton";

export default function Table({
  heading,
  columns,
  data,
  className = "",
  onRowClick,
}: TableProps) {
  const getAlignment = (align?: string) => {
    switch (align) {
      case "left":
        return "text-left";
      case "right":
        return "text-right";
      default:
        return "text-center";
    }
  };

  if (!data || !columns) {
    return <ChartSkeleton />;
  }

  return (
    <div
      className={`md:row-start-4 lg:row-start-3 rounded-lg border border-gray-700 pt-2 ${className}`}
    >
      {heading && (
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight p-4">
          {heading}
        </h2>
      )}
      <div className="relative w-full overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm font-thin text-gray-500">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`pb-3 ${getAlignment(column.align)} ${
                    column.width || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                className={`text-sm hover:bg-slate-900 transition-colors duration-200`}
                onClick={() => onRowClick?.(item)}
                role={onRowClick ? "button" : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={`${item.id || index}-${column.key}`}
                    className={`py-3 align-middle border-t border-gray-700 ${getAlignment(
                      column.align
                    )}`}
                    title={
                      column.tooltip
                        ? column.tooltip(item[column.key], item) || undefined
                        : undefined
                    }
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// // Example usage in another component
// const columns: Column[] = [
//   { key: 'position', header: 'Pos.', width: 'w-1/6', align: 'center' },
//   {
//     key: 'driver',
//     header: 'Driver',
//     width: 'w-3/6',
//     align: 'left',
//     render: (value, item) => (
//       <div className="flex items-center gap-2">
//         {item.team && (
//           <img
//             src={`/teams/${item.team}.svg`}
//             alt={item.team}
//             className="w-5 h-5"
//             onError={(e) => (e.currentTarget.src = "/vercel.svg")}
//           />
//         )}
//         {value || item.constructor}
//       </div>
//     ),
//   },
//   { key: 'points', header: 'Points', width: 'w-1/6', align: 'right' },
//   { key: 'status', header: 'Status', width: 'w-1/6', align: 'center' },
// ];

// // Using the table
// <Table
//   heading="Race Results"
//   columns={columns}
//   data={items}
//   onRowClick={(item) => console.log(item)}
// />
