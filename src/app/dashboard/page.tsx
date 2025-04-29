import { raceService } from "@/lib/api/index";

export default async function DashboardPage() {
  const raceData = await raceService.getRaceCalendar("2024");
  // console.log(raceCalendar);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">F1 Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <pre>{JSON.stringify(raceData, null, 2)}</pre>
      </div>
    </div>
  );
}
