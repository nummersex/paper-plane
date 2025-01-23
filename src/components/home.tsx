import React, { useState } from "react";
import GameCanvas from "./game/GameCanvas";
import ScoreBoard from "./game/ScoreBoard";
import GameControls from "./game/GameControls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Home = () => {
  const [score, setScore] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [bestDistance, setBestDistance] = useState(100);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    if (newScore > bestDistance) {
      setBestDistance(newScore);
    }
  };

  const handleReset = () => {
    setScore(0);
    setCurrentDistance(0);
    // This will trigger the GameCanvas to reset the plane position
    const gameCanvas = document.querySelector(".paper-plane");
    if (gameCanvas) {
      const event = new CustomEvent("resetPlane");
      gameCanvas.dispatchEvent(event);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 relative">
      <h1 className="text-3xl font-bold mb-4 text-primary">
        Paper Airplane Challenge
      </h1>

      <div className="relative w-full max-w-6xl">
        <GameCanvas
          onScoreUpdate={handleScoreUpdate}
          initialPosition={{ x: 100, y: 500 }}
        />

        <div className="absolute top-4 right-4">
          <ScoreBoard
            currentScore={score}
            bestDistance={bestDistance}
            currentDistance={currentDistance}
          />
        </div>
      </div>

      <GameControls
        onReset={handleReset}
        onSettings={() => setIsSettingsOpen(true)}
      />

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Settings panel content will go here.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
