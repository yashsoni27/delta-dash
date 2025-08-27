"use client";
import { f1MediaService, raceService } from "@/lib/api";
import Image from "next/image";
import { useEffect, useState } from "react";


type TrackCardProps = {
  name: string;
  location: string;
  country: string;
  circuitId: string;       
  onClick: () => void;
};


const TrackCard: React.FC<TrackCardProps> = ({ name, location, country, circuitId, onClick }) => {
  const [imageUrl, setImageUrl] = useState<string | null >(null);

  useEffect(() =>{
    let isMounted = true;
      f1MediaService.getblackTrackImg(circuitId).then(url =>{
        if(isMounted) setImageUrl(url);
      });
      return () => {
        isMounted = false;
        if (imageUrl) URL.revokeObjectURL(imageUrl);
      };
  },[circuitId]);
  return (
    <div
      onClick={onClick}
      className="
        rounded-xl
        bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900
        shadow-lg shadow-black/40
        cursor-pointer
        overflow-hidden
        transition-transform transition-shadow duration-300
        hover:scale-105 hover:shadow-2xl
        w-80
        min-h-[220px]
        flex flex-col
        text-white
        "
    >
      <div className="relative w-full h-44 bg-black">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain"
            sizes="(max-width: 500px) 100vw, 320px"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            Loading...
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-end">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-sm text-gray-400 mt-1">{location}, {country}</p>
      </div>
    </div>
  );
}

export default TrackCard;
