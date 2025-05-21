"use client";
import { driverService, f1MediaService } from "@/lib/api/index";
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
  const [season, setSeason] = useState<string>();
  const [driverImages, setDriverImages] = useState<{
    [key: string]: {
      imageUrl: string;
      numberLogo: string;
    };
  }>({});

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await driverService.getDriverStandings();
        if (response) {
          setSeason(response.season);
          setDrivers(response.standings);
        }
      } catch (e) {
        console.log("Error fetching drivers: ", e);
      }
    };

    fetchDrivers();
  }, []);

  useEffect(() => {
    const fetchDriverImages = async () => {
      const driverImagePromises = drivers.map(async (driver) => {
        try {
          const imageUrl = await f1MediaService.getDriverImage(
            driver.Driver.givenName,
            driver.Driver.familyName
          );
          const driverCode =
            driver.Driver.givenName.substring(0, 3) +
            driver.Driver.familyName.substring(0, 3);
          const numberLogo = await f1MediaService.getDriverNumberLogo(
            driverCode
          );
          // const constructorLogo = await f1MediaService.getConstructorLogo(
          //   season || "",
          //   driver.Constructors[driver.Constructors.length - 1].constructorId
          // );

          if (imageUrl && numberLogo) {
            return {
              driverId: driver.Driver.driverId,
              imageUrl,
              numberLogo,
            };
          }
        } catch (e) {
          console.log(
            `Error fetching driver image for ${driver.Driver.driverId}:`,
            e
          );
        }
        return null;
      });

      const results = await Promise.all(driverImagePromises);
      const newDriverImages = results.reduce(
        (
          acc: {
            [key: string]: {
              imageUrl: string;
              numberLogo: string;
            };
          },
          result
        ) => {
          if (result) {
            acc[result.driverId] = {
              imageUrl: result.imageUrl,
              numberLogo: result.numberLogo,
            };
          }
          return acc;
        },
        {}
      );

      setDriverImages(newDriverImages);
    };

    if (drivers.length > 0) {
      fetchDriverImages();
    }
  }, [drivers]);

  return (
    <>
      <div className="container mx-auto py-10 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center md:justify-items-normal gap-4">
          {drivers.map((driver, index) => (
            <div
              key={index}
              className={`relative rounded-md overflow-hidden h-[190px] w-[90%] md:w-full transition-transform duration-300 border group`}
              style={{
                background: getConstructorGradient(
                  driver.Constructors[driver.Constructors.length - 1]
                    .constructorId
                ),
                borderColor: getConstructorColor(
                  driver.Constructors[driver.Constructors.length - 1]
                    .constructorId
                ),
              }}
            >
              {/* Team logo as background */}
              <div className="absolute inset-0 flex items-center justify-end pl-14 opacity-20 pointer-events-none transition-all duration-500 ease-in-out group-hover:justify-center group-hover:pr-16">
                <div className="relative w-full h-3/4">
                  <Image
                    src={`/teams/${
                      driver.Constructors[driver.Constructors.length - 1]
                        .constructorId
                    }.svg`}
                    alt={`${
                      driver.Constructors[driver.Constructors.length - 1].name
                    } logo`}
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
                      driver.Constructors[driver.Constructors.length - 1]
                        .constructorId
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
                {driverImages[driver.Driver.driverId] ? (
                  <Image
                    src={driverImages[driver.Driver.driverId].numberLogo}
                    alt={`${driver.Driver.givenName} number`}
                    width={50}
                    height={50}
                    className="rounded-es-2xl rounded-se-2xl"
                    style={{
                      background: getConstructorColor(
                        driver.Constructors[driver.Constructors.length - 1]
                          .constructorId
                      ),
                      boxShadow: `0 0 15px 10px ${getConstructorColor(
                        driver.Constructors[driver.Constructors.length - 1]
                          .constructorId
                      )}`,
                    }}
                  />
                ) : (
                  <>
                    <p
                      className="text-4xl"
                      style={{
                        color: getConstructorHex(
                          driver.Constructors[driver.Constructors.length - 1]
                            .constructorId
                        ),
                      }}
                    >
                      {driver.Driver.permanentNumber}
                    </p>
                  </>
                )}
              </div>

              {/* Driver image - larger and right-aligned */}
              <div className="absolute right-0 bottom-0 h-full w-3/6">
                {driverImages[driver.Driver.driverId] ? (
                  <Image
                    src={driverImages[driver.Driver.driverId].imageUrl}
                    alt={`${driver.Driver.givenName} ${driver.Driver.familyName}`}
                    fill
                    className="object-cover object-center"
                    style={{ objectPosition: "bottom right" }}
                  />
                ) : (
                  <>
                    {/* <Image
                      src={`/drivers/${driver.Driver.driverId}.avif`}
                      alt={`${driver.Driver.givenName} ${driver.Driver.familyName}`}
                      fill
                      className="object-cover object-center"
                      style={{ objectPosition: "bottom right" }}
                    /> */}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
