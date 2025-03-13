import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">F1 Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/dashboard" 
          className="p-6 border rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p>View current F1 season overview</p>
        </Link>
        <Link 
          href="/drivers" 
          className="p-6 border rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold">Drivers</h2>
          <p>View driver standings and statistics</p>
        </Link>
        <Link 
          href="/constructors" 
          className="p-6 border rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold">Constructors</h2>
          <p>View constructor standings and statistics</p>
        </Link>
        <Link 
          href="/races" 
          className="p-6 border rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold">Races</h2>
          <p>View race calendar and results</p>
        </Link>
      </div>
    </main>
  );
}