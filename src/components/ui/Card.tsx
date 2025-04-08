interface CardProps {
  title: string;
  stat: string | number | null;
  subtitle?: React.ReactNode | string;
  className?: string;
  icon?: React.ReactNode | null;
}

export default function Card({
  title,
  stat,
  subtitle = "",
  className = "",
  icon = null,
}: CardProps) {
  return (
    <div
      className={`rounded-lg shadow-lg overflow-hidden flex flex-col justify-around max-w-md p-5 border border-gray-700 ${className}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-thin text-gray-300">{title}</h2>
        {icon && <span className="text-gray-400 text-lg">{icon}</span>}
      </div>
      <div className="flex flex-col">
        <div className="text-xl font-thin mb-1">{stat}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  );
}
