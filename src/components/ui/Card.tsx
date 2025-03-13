interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="border-b px-6 py-3">
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}