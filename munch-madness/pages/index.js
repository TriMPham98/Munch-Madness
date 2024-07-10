import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Trophy } from "lucide-react";
import ShotClock from "../components/ShotClock";
import { ThemeProvider } from "../components/ThemeContext";
import ToggleButton from "../components/ToggleButton";

const initialBracket = [
  ["Pizza", "Sushi"],
  ["Tacos", "Burgers"],
  ["Pasta", "Salad"],
  ["Steak", "Curry"],
  ["Ramen", "Pho"],
  ["BBQ", "Fried Chicken"],
  ["Dim Sum", "Falafel"],
  ["Pad Thai", "Biryani"],
];

const WinnerScreen = ({ winner, onRestart }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Card className="w-full max-w-md text-center dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold dark:text-white">
            We Have a Winner!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Trophy className="mx-auto my-6 text-yellow-400" size={100} />
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Tonight's Dinner Choice:
          </h2>
          <p className="text-4xl font-bold mb-8 text-purple-700 dark:text-purple-400">
            {winner}
          </p>
          <Button
            onClick={onRestart}
            className="w-full dark:bg-gray-700 dark:text-white">
            Start New Bracket
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const BracketApp = () => {
  const [currentRound, setCurrentRound] = useState(initialBracket);
  const [roundNumber, setRoundNumber] = useState(1);
  const [winner, setWinner] = useState(null);
  const [activeMatchup, setActiveMatchup] = useState(0);
  const [isClockActive, setIsClockActive] = useState(true);
  const [clockKey, setClockKey] = useState(0);

  const advanceWinner = useCallback(
    (matchupIndex, winnerIndex) => {
      const newRound = [...currentRound];
      const winner = newRound[matchupIndex][winnerIndex];
      newRound[matchupIndex] = [winner];

      if (newRound.every((matchup) => matchup.length === 1)) {
        if (newRound.length === 1) {
          setWinner(winner);
          setIsClockActive(false);
          return;
        }
        const nextRound = [];
        for (let i = 0; i < newRound.length; i += 2) {
          if (i + 1 < newRound.length) {
            nextRound.push([newRound[i][0], newRound[i + 1][0]]);
          } else {
            nextRound.push([newRound[i][0]]);
          }
        }
        setCurrentRound(nextRound);
        setRoundNumber(roundNumber + 1);
        setActiveMatchup(0);
      } else {
        setCurrentRound(newRound);
        setActiveMatchup(matchupIndex + 1);
      }
      setIsClockActive(true);
      setClockKey((prevKey) => prevKey + 1); // Reset the clock
    },
    [currentRound, roundNumber]
  );

  const handleTimeout = useCallback(() => {
    const randomWinner = Math.floor(Math.random() * 2);
    advanceWinner(activeMatchup, randomWinner);
  }, [activeMatchup, advanceWinner]);

  const restartBracket = () => {
    setCurrentRound(initialBracket);
    setRoundNumber(1);
    setWinner(null);
    setActiveMatchup(0);
    setIsClockActive(true);
    setClockKey((prevKey) => prevKey + 1); // Reset the clock
  };

  if (winner) {
    return (
      <ThemeProvider>
        <div className="dark:bg-gray-900 min-h-screen">
          <div className="container mx-auto p-4">
            <div className="flex justify-end mb-4">
              <ToggleButton />
            </div>
            <WinnerScreen winner={winner} onRestart={restartBracket} />
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold dark:text-white">
              Dinner Decision Bracket
            </h1>
            <ToggleButton />
          </div>
          <h2 className="text-xl mb-4 dark:text-white">Round {roundNumber}</h2>
          <div className="flex justify-center mb-4">
            <ShotClock
              onTimeout={handleTimeout}
              isActive={isClockActive}
              key={clockKey}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRound.map((matchup, matchupIndex) => (
              <Card
                key={matchupIndex}
                className={`w-full ${
                  matchupIndex === activeMatchup ? "ring-2 ring-blue-500" : ""
                } dark:bg-gray-800`}>
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    Matchup {matchupIndex + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => advanceWinner(matchupIndex, 0)}
                      className={`w-full ${
                        matchup.length === 1
                          ? "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                          : "dark:bg-gray-700"
                      } dark:text-white`}
                      disabled={
                        matchup.length === 1 || matchupIndex !== activeMatchup
                      }>
                      {matchup[0]}
                    </Button>
                    {matchup[1] && (
                      <Button
                        onClick={() => advanceWinner(matchupIndex, 1)}
                        className="w-full dark:bg-gray-700 dark:text-white"
                        disabled={matchupIndex !== activeMatchup}>
                        {matchup[1]}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default BracketApp;
