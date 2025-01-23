import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface GameCanvasProps {
  onScoreUpdate?: (score: number) => void;
  initialPosition?: { x: number; y: number };
  gravity?: number;
  onReset?: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  onScoreUpdate = () => {},
  initialPosition = { x: 100, y: 500 },
  gravity = 9.81,
  onReset = () => {},
}) => {
  const controls = useAnimation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });

  // Placeholder trajectory points
  const trajectoryPoints = [
    { x: 100, y: 500 },
    { x: 200, y: 450 },
    { x: 300, y: 425 },
    { x: 400, y: 450 },
    { x: 500, y: 500 },
  ];

  return (
    <div
      ref={canvasRef}
      className="w-full h-[782px] bg-slate-100 relative overflow-hidden"
      onMouseDown={(e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          setDragEnd({ x: e.clientX, y: e.clientY });
        }
      }}
      onMouseUp={() => {
        setIsDragging(false);
      }}
      onMouseLeave={() => {
        setIsDragging(false);
      }}
    >
      {/* Office background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200">
        {/* Desk */}
        <div className="absolute bottom-0 w-full h-48 bg-amber-800/80" />
        {/* Wall details */}
        <div className="absolute top-0 w-full h-64 flex justify-around items-start p-8">
          <div className="w-32 h-40 bg-gray-300/50 rounded-sm" />{" "}
          {/* Picture frame */}
          <div className="w-24 h-32 bg-gray-300/50 rounded-sm" />{" "}
          {/* Picture frame */}
        </div>
      </div>

      {/* Trajectory preview line */}
      {isDragging && (
        <svg className="absolute inset-0 pointer-events-none">
          <path
            d={`M ${trajectoryPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
          />
        </svg>
      )}

      {/* Paper airplane */}
      <motion.div
        className="absolute w-16 h-16 cursor-grab active:cursor-grabbing paper-plane z-50"
        initial={{
          x: initialPosition.x,
          y: initialPosition.y,
        }}
        animate={controls}
        drag
        dragConstraints={{
          top: 0,
          left: 0,
          right: 1512,
          bottom: 782,
        }}
        whileDrag={{ scale: 1.1 }}
        onDrag={(event, info) => {
          // Check if plane is beyond container bounds
          const x = info.point.x;
          const y = info.point.y;

          // Container dimensions (matching dragConstraints)
          const containerWidth = 1512;
          const containerHeight = 782;

          const isOutOfBounds =
            x < 0 || x > containerWidth || y < 0 || y > containerHeight;

          if (isOutOfBounds) {
            controls.start({
              x: initialPosition.x,
              y: initialPosition.y,
              transition: { duration: 0.5 },
            });
          }
        }}
        onDragEnd={(event, info) => {
          const targetRect = document
            .querySelector(".target-circle")
            ?.getBoundingClientRect();
          if (targetRect) {
            const planeRect = event.target.getBoundingClientRect();
            if (
              planeRect.left < targetRect.right &&
              planeRect.right > targetRect.left &&
              planeRect.top < targetRect.bottom &&
              planeRect.bottom > targetRect.top
            ) {
              onScoreUpdate(100);
              setTimeout(() => {
                controls.start({
                  x: initialPosition.x,
                  y: initialPosition.y,
                  transition: { duration: 0.5 },
                });
              }, 500);
            }
          }
        }}
      >
        <div
          className="w-full h-full relative"
          style={{
            transform: "rotate(-45deg)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(50% 0, 50% 100%, 0 50%)",
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </motion.div>

      {/* Computer monitor target */}
      <div className="absolute bottom-48 right-32 w-48 h-40 bg-gray-800 rounded-lg p-2">
        <div className="w-full h-full bg-blue-100 rounded-sm flex items-center justify-center">
          <div className="target-circle w-32 h-32 rounded-full border-4 border-dashed border-red-400 opacity-50" />
        </div>
        {/* Monitor stand */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gray-700" />
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gray-600" />
      </div>

      {/* Distance markers */}
      <div className="absolute bottom-4 left-0 w-full flex justify-between px-8 text-sm text-gray-600">
        <span>0m</span>
        <span>5m</span>
        <span>10m</span>
        <span>15m</span>
        <span>20m</span>
      </div>
    </div>
  );
};

export default GameCanvas;
