import CountdownCard from "@/components/ui/CountdownCard";
import { getNextRace } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  

  return (
    <main className="flex p-24">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CountdownCard />
        <Link
          href="/dashboard"
          className="p-5 border rounded-lg hover:bg-gray-900 transition-colors"
        >
          <h2 className="text-2xl">Dashboard</h2>
          <p>View current F1 season overview</p>
        </Link>
        <Link
          href="/drivers"
          className="p-5 border rounded-lg hover:bg-gray-900 transition-colors"
        >
          <h2 className="text-2xl">Drivers</h2>
          <p>View driver standings and statistics</p>
        </Link>
        <Link
          href="/constructors"
          className="p-5 border rounded-lg hover:bg-gray-900 transition-colors"
        >
          <h2 className="text-2xl">Constructors</h2>
          <p>View constructor standings and statistics</p>
        </Link>
        <Link
          href="/races"
          className="p-5 border rounded-lg hover:bg-gray-900 transition-colors"
        >
          <h2 className="text-2xl">Races</h2>
          <p>View race calendar and results</p>
        </Link>
      </div>
    </main>
  );
}
