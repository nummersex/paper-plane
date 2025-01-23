import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GameControlsProps {
  onReset?: () => void;
  onSettings?: () => void;
}

const GameControls = ({
  onReset = () => {},
  onSettings = () => {},
}: GameControlsProps) => {
  return (
    <div className="fixed bottom-4 right-4 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onReset}
              className="hover:bg-accent"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Game</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onSettings}
              className="hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default GameControls;
