import { getConstructorColor, getConstructorGradient } from "@/lib/utils";
import Image from "next/image";

export default function Home() {
  const teams = [
    {
      name: "McLaren",
      code: "mclaren",
      chassis: "MCL39",
      carImage: "/cars/mclaren.avif",
      logoImage: "/teams/mclaren.svg",
      drivers: ["/drivers/norris.avif", "/drivers/piastri.avif"],
    },
    {
      name: "Mercedes",
      code: "mercedes",
      chassis: "W16",
      carImage: "/cars/mercedes.avif",
      logoImage: "/teams/mercedes.svg",
      drivers: ["/drivers/russell.avif", "/drivers/antonelli.avif"],
    },
    {
      name: "Red Bull Racing",
      code: "red_bull",
      chassis: "RB21",
      carImage: "/cars/red_bull.avif",
      logoImage: "/teams/red_bull.svg",
      drivers: ["/drivers/verstappen.avif", "/drivers/lawson.avif"],
    },
    {
      name: "Williams",
      code: "williams",
      chassis: "FW47",
      carImage: "/cars/williams.avif",
      logoImage: "/teams/williams.svg",
      drivers: ["/drivers/albon.avif", "/drivers/sainz.avif"],
    },
    {
      name: "Aston Martin",
      code: "aston_martin",
      chassis: "AMR25",
      carImage: "/cars/aston_martin.avif",
      logoImage: "/teams/aston_martin.svg",
      drivers: ["/drivers/alonso.avif", "/drivers/stroll.avif"],
    },
    {
      name: "Kick Sauber",
      code: "sauber",
      chassis: "C45",
      carImage: "/cars/sauber.avif",
      logoImage: "/teams/sauber.svg",
      drivers: ["/drivers/hulkenberg.avif", "/drivers/bortoleto.avif"],
    },
    {
      name: "Ferrari",
      code: "ferrari",
      chassis: "SF-25",
      carImage: "/cars/ferrari.avif",
      logoImage: "/teams/ferrari.svg",
      drivers: ["/drivers/leclerc.avif", "/drivers/hamilton.avif"],
    },
    {
      name: "Alpine",
      code: "alpine",
      chassis: "A525",
      carImage: "/cars/alpine.avif",
      logoImage: "/teams/alpine.svg",
      drivers: ["/drivers/gasly.avif", "/drivers/doohan.avif"],
    },
    {
      name: "RB",
      code: "rb",
      chassis: "VCARB 02",
      carImage: "/cars/rb.avif",
      logoImage: "/teams/rb.svg",
      drivers: ["/drivers/tsunoda.avif", "/drivers/hadjar.avif"],
    },
    {
      name: "Haas",
      code: "haas",
      chassis: "VF-25",
      carImage: "/cars/haas.avif",
      logoImage: "/teams/haas.svg",
      drivers: ["/drivers/ocon.avif", "/drivers/bearman.avif"],
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((team, index) => (
              <div
                key={index}
                className={`rounded-lg overflow-hidden transition-all duration-300 relative border`}
                style={{
                  background: getConstructorGradient(team.code),
                  borderColor: getConstructorColor(team.code),
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                  <div className="relative w-full h-3/5">
                    <Image
                      src={team.logoImage}
                      alt={`${team.name} logo`}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>

                <div className="p-5 pb-0 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl">{team.name}</h2>
                      <p className="text-xs opacity-50">{team.chassis}</p>
                    </div>
                    <div className="flex space-x-1">
                      {team.drivers.map((driver, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-full overflow-hidden"
                          style={{
                            backgroundColor: getConstructorColor(team.code),
                          }}
                        >
                          <Image
                            src={driver}
                            width={40}
                            height={40}
                            alt={`${team.name} driver ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative h-32 sm:h-40 md:h-32 lg:h-40 xl:h-38 w-full">
                    <Image
                      src={team.carImage}
                      layout="fill"
                      alt={`${team.name} car`}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
