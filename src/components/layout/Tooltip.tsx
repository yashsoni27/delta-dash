"use client";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
  return (
    <div className="group relative">
      {children}
      <span className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 w-max opacity-0 transition-opacity group-hover:opacity-100 group-hover:duration-500 bg-slate-800 p-3 text-xs font-thin rounded-md">
        {text}
      </span>
    </div>
  );
}
