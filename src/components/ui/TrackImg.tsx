import { getTrackImg } from "@/lib/api";
import Image from "next/image";
import { useEffect, useState } from "react";

interface TrackImgProps {
  circuitId: string;
  circuitName: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function TrackImg({
  circuitId,
  circuitName,
  className = "",
  width = 700,
  height = 450,
}: TrackImgProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        const url = await getTrackImg(circuitId);
        if (url) {
          setImageUrl(url);
          setError(null);
        } else {
          setError("Failed to load track image");
        }
      } catch (err) {
        setError("Error loading track image");
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup function to revoke object URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [circuitId]);

  if (isLoading) {
    return (
      <div
        className="animate-pulse bg-gray-800 rounded-lg"
        style={{ width, height }}
      />
    );
  }

  if (error || !imageUrl) {
    return <div className="text-sm">Failed to load track image</div>;
  }

  return (
    <>
      <h2 className="pb-2">{circuitName}</h2>
      <Image
        src={imageUrl}
        alt={`${circuitId} track layout`}
        width={width}
        height={height}
        className={`rounded-lg ${className}`}
        priority
      />
    </>
  );
}
