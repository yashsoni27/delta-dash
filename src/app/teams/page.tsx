"use client";
import {
  constructorService,
  driverService,
  f1MediaService,
} from "@/lib/api/index";
import { getConstructorColor, getConstructorGradient } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const teamContainerRef = useRef<HTMLDivElement | null>(null);
  const [teams, setTeams] = useState<any>([]);
  const [carImages, setCarImages] = useState<{ [key: string]: string }>({});
  const [driverImages, setDriverImages] = useState<{ [key: string]: string }>(
    {}
  );

  const teamsInfo = [
    {
      name: "McLaren",
      code: "mclaren",
      chassis: "MCL39",
      carImage: "/cars/mclaren.avif",
      logoImage: "/teams/mclaren.svg",
      drivers: ["/drivers/norris.avif", "/drivers/piastri.avif"],
      details: {
        fullName: "McLaren Formula 1 Team",
        base: "Woking, United Kingdom",
        teamChief: "Andrea Stella",
        technicalChief: "Peter Prodromou / Neil Houldey",
        powerUnit: "Mercedes",
        firstEntry: "1996",
        worldChampionships: "9",
      },
    },
    {
      name: "Mercedes",
      code: "mercedes",
      chassis: "W16",
      carImage: "/cars/mercedes.avif",
      logoImage: "/teams/mercedes.svg",
      drivers: ["/drivers/russell.avif", "/drivers/antonelli.avif"],
      details: {
        fullName: "Mercedes-AMG PETRONAS Formula One Team",
        base: "Brackley, United Kingdom",
        teamChief: "Toto Wolff",
        technicalChief: "James Allison",
        powerUnit: "Mercedes",
        firstEntry: "1970",
        worldChampionships: "8",
      },
    },
    {
      name: "Red Bull Racing",
      code: "red_bull",
      chassis: "RB21",
      carImage: "/cars/red_bull.avif",
      logoImage: "/teams/red_bull.svg",
      drivers: ["/drivers/max_verstappen.avif", "/drivers/tsunoda.avif"],
      details: {
        fullName: "Oracle Red Bull Racing",
        base: "Milton Keynes, United Kingdom",
        teamChief: "Christian Horner",
        technicalChief: "Pierre Waché",
        powerUnit: "Honda",
        firstEntry: "1997",
        worldChampionships: "6",
      },
    },
    {
      name: "Williams",
      code: "williams",
      chassis: "FW47",
      carImage: "/cars/williams.avif",
      logoImage: "/teams/williams.svg",
      drivers: ["/drivers/albon.avif", "/drivers/sainz.avif"],
      details: {
        fullName: "Williams Racing",
        base: "Grove, United Kingdom",
        teamChief: "James Vowles",
        technicalChief: "Pat Fry",
        powerUnit: "Mercedes",
        firstEntry: "1978",
        worldChampionships: "9",
      },
    },
    {
      name: "Aston Martin",
      code: "aston_martin",
      chassis: "AMR25",
      carImage: "/cars/aston_martin.avif",
      logoImage: "/teams/aston_martin.svg",
      drivers: ["/drivers/alonso.avif", "/drivers/stroll.avif"],
      details: {
        fullName: "Aston Martin Aramco Formula One Team",
        base: "Silverstone, United Kingdom",
        teamChief: "Andy Cowell",
        technicalChief: "Enrico Cardile",
        powerUnit: "Mercedes",
        firstEntry: "2018",
        worldChampionships: "0",
      },
    },
    {
      name: "Kick Sauber",
      code: "sauber",
      chassis: "C45",
      carImage: "/cars/sauber.avif",
      logoImage: "/teams/sauber.svg",
      drivers: ["/drivers/hulkenberg.avif", "/drivers/bortoleto.avif"],
      details: {
        fullName: "Stake F1 Team Kick Sauber",
        base: "Hinwil, Switzerland",
        teamChief: "Mattia Binotto",
        technicalChief: "James Key",
        powerUnit: "Ferrari",
        firstEntry: "1993",
        worldChampionships: "0",
      },
    },
    {
      name: "Ferrari",
      code: "ferrari",
      chassis: "SF-25",
      carImage: "/cars/ferrari.avif",
      logoImage: "/teams/ferrari.svg",
      drivers: ["/drivers/leclerc.avif", "/drivers/hamilton.avif"],
      details: {
        fullName: "Scuderia Ferrari HP",
        base: "Maranello, Italy",
        teamChief: "Frédéric Vasseur",
        technicalChief: "Loic Serra / Enrico Gualtieri",
        powerUnit: "Ferrari",
        firstEntry: "1950",
        worldChampionships: "16",
      },
    },
    {
      name: "Alpine",
      code: "alpine",
      chassis: "A525",
      carImage: "/cars/alpine.avif",
      logoImage: "/teams/alpine.svg",
      drivers: ["/drivers/gasly.avif", "/drivers/doohan.avif"],
      details: {
        fullName: "BWT Alpine Formula One Team",
        base: "Enstone, United Kingdom",
        teamChief: "Oliver Oakes",
        technicalChief: "David Sanchez",
        powerUnit: "Renault",
        firstEntry: "1986",
        worldChampionships: "2",
      },
    },
    {
      name: "RB",
      code: "rb",
      chassis: "VCARB 02",
      carImage: "/cars/rb.avif",
      logoImage: "/teams/rb.svg",
      drivers: ["/drivers/lawson.avif", "/drivers/hadjar.avif"],
      details: {
        fullName: "Visa Cash App Racing Bulls Formula One Team",
        base: "Faenza, Italy",
        teamChief: "Laurent Mekies",
        technicalChief: "Jody Egginton",
        powerUnit: "Honda",
        firstEntry: "1985",
        worldChampionships: "0",
      },
    },
    {
      name: "Haas",
      code: "haas",
      chassis: "VF-25",
      carImage: "/cars/haas.avif",
      logoImage: "/teams/haas.svg",
      drivers: ["/drivers/ocon.avif", "/drivers/bearman.avif"],
      details: {
        fullName: "MoneyGram Haas F1 Team",
        base: "Kannapolis, United States",
        teamChief: "Ayao Komatsu",
        technicalChief: "Andrea De Zordo",
        powerUnit: "Ferrari",
        firstEntry: "2016",
        worldChampionships: "0",
      },
    },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        teamContainerRef.current &&
        !teamContainerRef.current.contains(event.target as Node)
      ) {
        setSelectedTeam(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTeamsAndDrivers = async () => {
      try {
        const response = await constructorService.getConstructorStandings();
        if (response) {
          const mergedTeams = await Promise.all(
            response.standings.map(async (standing: any) => {
              const teamInfo = teamsInfo.find(
                (team) => team.code === standing.Constructor.constructorId
              );

              // const driversResponse =
              //   await driverService.getDriversByConstructor(
              //     "current",
              //     standing.Constructor.constructorId
              //   );

              // const drivers = driversResponse?.data?.Drivers || [];
              // const driverImagePromises =
              //   drivers.map(async (driver: any) => {
              //     try {
              //       const imageUrl = await f1MediaService.getDriverImage(
              //         driver.givenName,
              //         driver.familyName
              //       );
              //       return { driverId: driver.driverId, imageUrl };
              //     } catch (error) {
              //       console.error(
              //         `Error fetching driver image for ${driver.driverId}:`,
              //         error
              //       );
              //       return null;
              //     }
              //   }) || [];

              // const driverImages = await Promise.all(driverImagePromises);
              // const driverImageMap = driverImages.reduce(
              //   (acc: { [key: string]: string }, result: any) => {
              //     if (result) {
              //       acc[result.driverId] = result.imageUrl;
              //     }
              //     return acc;
              //   },
              //   {}
              // );

              // setDriverImages((prev) => ({ ...prev, ...driverImageMap }));

              return {
                ...standing,
                ...teamInfo,
                // drivers:
                //   drivers.map((driver: any) => ({
                //     driverId: driver.driverId,
                //     imageUrl:
                //       driverImageMap[driver.driverId] ||
                //       `/drivers/${driver.driverId}.avif`,
                //   })) || [],
              };
            })
          );
          setTeams(mergedTeams);
        }
      } catch (e) {
        console.log("Error fetching teams and drivers: ", e);
      }
    };

    fetchTeamsAndDrivers();
  }, []);

  useEffect(() => {
    const fetchCarImages = async () => {
      const currentSeason = "2025"; // You might want to make this dynamic
      const imagePromises = teams.map(async (team: any) => {
        try {
          const imageUrl = await f1MediaService.getCarImage(
            currentSeason,
            team.code
          );
          if (imageUrl) {
            return { code: team.code, imageUrl };
          }
        } catch (error) {
          console.error(`Error fetching car image for ${team.code}:`, error);
        }
        return null;
      });

      const results = await Promise.all(imagePromises);
      const newCarImages = results.reduce(
        (acc: { [key: string]: string }, result) => {
          if (result) {
            acc[result.code] = result.imageUrl;
          }
          return acc;
        },
        {}
      );

      setCarImages(newCarImages);
    };

    if (teams.length > 0) {
      fetchCarImages();
    }
  }, [teams]);

  return (
    <>
      <div className="container mx-auto py-10 min-h-screen">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center md:justify-items-normal gap-4"
          ref={teamContainerRef}
        >
          {teams.map((team: any, index: string) => (
            <div key={index} className="relative w-[90%] md:w-full">
              <div
                onClick={() =>
                  setSelectedTeam(selectedTeam === team.code ? null : team.code)
                }
                className={`rounded-lg overflow-hidden transition-all duration-300 relative border group cursor-pointer`}
                style={{
                  background: getConstructorGradient(team.code),
                  borderColor: getConstructorColor(team.code),
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none transition-transform duration-300 group-hover:-translate-y-3">
                  <div className="relative w-full h-3/6">
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
                      <p className="text-lg">{team.name}</p>
                      <p className="text-xs opacity-50">{team.chassis}</p>
                    </div>
                    {/* <div className="flex space-x-1">
                      {team.drivers.map((driver: any, idx: string) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-full overflow-hidden"
                          style={{
                            backgroundColor: getConstructorColor(team.code),
                          }}
                        >
                          <Image
                            src={driver.imageUrl}
                            width={40}
                            height={40}
                            alt={`${team.name} driver ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div> */}
                  </div>

                  <div className="relative mt-10 h-32 sm:h-40 md:h-32 lg:h-40 xl:h-32 w-full">
                    {/* <Image
                      src={team.carImage}
                      layout="fill"
                      alt={`${team.name} car`}
                      className="object-contain"
                    /> */}
                    {carImages[team.code] ? (
                      <Image
                        src={carImages[team.code]}
                        layout="fill"
                        alt={`${team.name} car`}
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-pulse bg-gray-700 w-full h-full rounded-lg"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedTeam === team.code && (
                <div className="w-full flex justify-center">
                  <div className="absolute w-10/12 bg-gray-950 border border-gray-700 text-xs font-thin p-5 rounded-lg mt-1 shadow-lg z-20 ">
                    <p className="text-center text-base pb-5">
                      {team.details.fullName}
                    </p>
                    <div className="grid grid-cols-2 text-xs text-center gap-y-3">
                      <div>
                        <p className="opacity-50">Base</p>
                        <p>{team.details.base}</p>
                      </div>
                      <div>
                        <p className="opacity-50">Team Chief</p>
                        <p>{team.details.teamChief}</p>
                      </div>
                      <div>
                        <p className="opacity-50">Technical Chief</p>
                        <p>{team.details.technicalChief}</p>
                      </div>
                      <div>
                        <p className="opacity-50">Power Unit</p>
                        <p>{team.details.powerUnit}</p>
                      </div>
                      <div>
                        <p className="opacity-50">First Entry</p>
                        <p>{team.details.firstEntry}</p>
                      </div>
                      <div>
                        <p className="opacity-50">World Championships</p>
                        <p>{team.details.worldChampionships}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
