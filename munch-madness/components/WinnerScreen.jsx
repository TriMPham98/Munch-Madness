import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Trophy } from "lucide-react";

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

export default WinnerScreen;
