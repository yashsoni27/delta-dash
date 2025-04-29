"use client";
import { driverService } from "@/lib/api/index";
import {
  getConstructorColor,
  getConstructorGradient,
  getConstructorHex,
} from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Driver {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    permanentNumber: string;
    code: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
  };
  Constructors: {
    constructorId: string;
    name: string;
    nationality: string;
  }[];
}

export default function Home() {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await driverService.getDriverStandings();
        if (response) {
          setDrivers(response.standings);
        }
      } catch (e) {
        console.log("Error fetching drivers: ", e);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <>
      <div className="container mx-auto py-10 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {drivers.map((driver, index) => (
            <div
              key={index}
              className={`relative rounded-md overflow-hidden h-[190px] transition-transform duration-300 border group`}
              style={{
                background: getConstructorGradient(
                  driver.Constructors[driver.Constructors.length - 1].constructorId
                ),
                borderColor: getConstructorColor(
                  driver.Constructors[driver.Constructors.length - 1].constructorId
                ),
              }}
            >
              {/* Team logo as background */}
              <div className="absolute inset-0 flex items-center justify-end pl-14 opacity-20 pointer-events-none transition-all duration-500 ease-in-out group-hover:justify-center group-hover:pr-16">
                <div className="relative w-full h-3/4">
                  <Image
                    src={`/teams/${driver.Constructors[driver.Constructors.length - 1].constructorId}.svg`}
                    alt={`${driver.Constructors[driver.Constructors.length - 1].name} logo`}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>

              {/* Driver information */}
              <div className="absolute top-5 left-5 z-10">
                <p
                  className="text-lg font-bold"
                  style={{
                    color: getConstructorHex(
                      driver.Constructors[driver.Constructors.length - 1].constructorId
                    ),
                  }}
                >
                  {driver.Driver.familyName}
                </p>
                <p className="text-xs opacity-50">
                  {driver.Constructors[driver.Constructors.length - 1].name}
                </p>
              </div>

              {/* Number */}
              <div className="absolute bottom-5 left-5 z-10">
                <p
                  className="text-4xl"
                  style={{
                    color: getConstructorHex(
                      driver.Constructors[driver.Constructors.length - 1].constructorId
                    ),
                  }}
                >
                  {driver.Driver.permanentNumber}
                </p>
              </div>

              {/* Driver image - larger and right-aligned */}
              <div className="absolute right-0 bottom-0 h-full w-3/6">
                <Image
                  src={`/drivers/${driver.Driver.driverId}.avif`}
                  alt={`${driver.Driver.givenName} ${driver.Driver.familyName}`}
                  fill
                  className="object-cover object-center"
                  style={{ objectPosition: "bottom right" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
