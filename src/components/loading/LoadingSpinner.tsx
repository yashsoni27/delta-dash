export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="relative">
        {/* Outer tire rim */}
        <div className="animate-spin rounded-full h-16 w-16 border-8 border-gray-300"></div>
        {/* Tire tread pattern */}
        <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-8 border-dashed border-f1-red"></div>
        {/* Center hub cap */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 bg-f1-red rounded-full">
          <div className="absolute animate-pulse inset-0 flex items-center justify-center text-white font-bold text-xs">F1</div>
        </div>
      </div>
    </div>
  );
}
