import React, { useState, useEffect } from "react";

const ShotClock = ({ onTimeout, isActive, key }) => {
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
    setTimeLeft(24);
  }, [key]);

  return (
    <div
      className={`text-4xl font-bold ${
        timeLeft <= 5 ? "text-red-600" : "dark:text-white"
      }`}>
      {timeLeft}
    </div>
  );
};

export default ShotClock;
