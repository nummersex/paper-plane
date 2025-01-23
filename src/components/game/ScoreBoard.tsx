import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Target, ArrowRight } from "lucide-react";

interface ScoreBoardProps {
  currentScore?: number;
  bestDistance?: number;
  currentDistance?: number;
}

const ScoreBoard = ({
  currentScore = 0,
  bestDistance = 100,
  currentDistance = 0,
}: ScoreBoardProps) => {
  return (
    <Card className="w-[300px] p-4 bg-white shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Current Score</span>
          </div>
          <span className="text-lg font-bold">{currentScore}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Best Distance</span>
          </div>
          <span className="text-lg font-bold">{bestDistance}m</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Current Distance</span>
          </div>
          <span className="text-lg font-bold">{currentDistance}m</span>
        </div>
      </div>
    </Card>
  );
};

export default ScoreBoard;
