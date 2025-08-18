"use client";
import Image from "next/image";

type TrackCardProps = {
  name: string;
  location: string;
  image: string;       
  onClick: () => void;
};

const TrackCard: React.FC<TrackCardProps> = ({ name, location, image, onClick }) => (
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
      <Image
        src={`/circuits/${image}`}
        alt={name}
        fill
        className="object-contain"
        sizes="(max-width: 500px) 100vw, 320px"
      />
    </div>
    <div className="p-5 flex-1 flex flex-col justify-end">
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="text-sm text-gray-400 mt-1">{location}</p>
    </div>
  </div>
);

export default TrackCard;
