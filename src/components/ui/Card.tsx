interface CardProps {
  title: string;
  value?: string | number | null;
  subtitle: React.ReactNode | string;
  className?: string;
  icon?: React.ReactNode | null;
}

export default function Card({
  title,
  value = '',
  subtitle = "",
  className = "",
  icon = null,
}: CardProps) {
  return (
    <div
      className={`rounded-lg shadow-lg overflow-hidden max-w-md p-5 border border-gray-700 ${className}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-left">{title}</h2>
        {icon && <span className="text-gray-400 text-lg">{icon}</span>}
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold mb-1">{value}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </div>
    </div>
  );
}
