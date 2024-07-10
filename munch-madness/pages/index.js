import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Trophy } from "lucide-react";

const initialBracket = [
  ["Pizza", "Sushi"],
  ["Tacos", "Burgers"],
  ["Pasta", "Salad"],
  ["Steak", "Curry"],
];

const WinnerScreen = ({ winner, onRestart }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            We Have a Winner!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Trophy className="mx-auto my-6 text-yellow-400" size={100} />
          <h2 className="text-2xl font-semibold mb-6">
            Tonight's Dinner Choice:
          </h2>
          <p className="text-4xl font-bold mb-8 text-purple-700">{winner}</p>
          <Button onClick={onRestart} className="w-full">
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

  const advanceWinner = (matchupIndex, winnerIndex) => {
    const newRound = [...currentRound];
    const winner = newRound[matchupIndex][winnerIndex];
    newRound[matchupIndex] = [winner];

    if (newRound.every((matchup) => matchup.length === 1)) {
      if (newRound.length === 1) {
        setWinner(winner);
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
    } else {
      setCurrentRound(newRound);
    }
  };

  const restartBracket = () => {
    setCurrentRound(initialBracket);
    setRoundNumber(1);
    setWinner(null);
  };

  if (winner) {
    return <WinnerScreen winner={winner} onRestart={restartBracket} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dinner Decision Bracket</h1>
      <h2 className="text-xl mb-4">Round {roundNumber}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentRound.map((matchup, matchupIndex) => (
          <Card key={matchupIndex} className="w-full">
            <CardHeader>
              <CardTitle>Matchup {matchupIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Button
                  onClick={() => advanceWinner(matchupIndex, 0)}
                  className="w-full mr-2"
                  disabled={matchup.length === 1}>
                  {matchup[0]}
                </Button>
                {matchup[1] && (
                  <Button
                    onClick={() => advanceWinner(matchupIndex, 1)}
                    className="w-full ml-2">
                    {matchup[1]}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BracketApp;
