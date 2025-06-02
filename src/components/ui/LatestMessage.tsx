import { useEffect, useState } from "react";
import moment from "moment";

interface LatestMessageProps {
  message: any;
}

export default function LatestMessage({ message }: LatestMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div className="fixed top-3 left-0 right-0 z-50 m-4 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 p-4 bg-slate-900 border border-gray-800 rounded-md">
        <div className="font-mono text-slate-300">
          {message.Category === "Flag" && (
            <img
              alt={message.Flag}
              src={`/flags/${
                message.Flag === "CLEAR" ? "GREEN" : message.Flag
              }.svg`}
              className="inline-block h-6 w-6 mx-2"
              loading="lazy"
              decoding="async"
            />
          )}
          <span>
            {message.Message?.trim() ||
              message.TrackStatus ||
              message.SessionStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
