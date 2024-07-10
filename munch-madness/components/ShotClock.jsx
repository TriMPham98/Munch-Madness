import React, { useState, useEffect } from "react";

const ShotClock = ({ onTimeout, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(24);

  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onTimeout();
    }

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeout]);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(24);
    }
  }, [isActive]);

  return (
    <div
      className={`text-4xl font-bold ${
        timeLeft <= 5 ? "text-red-600" : "text-black"
      }`}>
      {timeLeft}
    </div>
  );
};

export default ShotClock;
