import { getFastestLaps, getRaceCalendar } from "@/lib/api";

export default async function DashboardPage() {
  const raceCalendar = await getRaceCalendar("2024");
  // console.log(raceCalendar);
  // const fastestLaps = await getFastestLaps("current", "1");
  // console.log("fastestLaps: ",fastestLaps);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">F1 Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"></div>
    </div>
  );
}
