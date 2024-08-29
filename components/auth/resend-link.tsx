"use client";

import { useEffect, useState } from "react";

interface ResendLinkProps {
  sendAt: string;
  onClick: () => void;
}

const ResendLink = ({ sendAt, onClick }: ResendLinkProps) => {
  const [timeRemaining, setTimeRemaining] = useState(60);

  useEffect(() => {
    // Calculate the initial time remaining based on `sendAt`
    const initialTimeRemaining = Math.floor(
      (new Date(sendAt).getTime() - new Date().getTime()) / 1000 + 60 // adding 60 seconds
    );

    setTimeRemaining(initialTimeRemaining);

    // Set a timer to count down the time remaining every second
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, [sendAt]);

  return (
    <div className="flex w-full justify-end gap-4 text-muted-foreground">
      {timeRemaining > 0 && (
        <p>00:{timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining}</p>
      )}
      {timeRemaining <= 0 && (
        <button
          type="button"
          className="hover:underline text-black font-medium disabled:cursor-not-allowed"
          onClick={onClick}
        >
          Resend
        </button>
      )}
    </div>
  );
};

export default ResendLink;
