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

  const checkBoundsAndReset = (x: number, y: number) => {
    const targetRect = document.querySelector("#game-container")?.getBoundingClientRect();
    if (!targetRect) return false;

    const isOutOfBounds =
      x < 0 || x > targetRect.width || y < 0 || y > targetRect.height;

    if (isOutOfBounds) {
      controls.start({
        x: initialPosition.x,
        y: initialPosition.y,
        transition: { duration: 0.5 },
      });
      onReset();
      return true;
    }
    return false;
  };

  const animatePlane = (velocityX: number, velocityY: number) => {
    const targetRect = document.querySelector("#game-container")?.getBoundingClientRect();
    const computerMonitorRect = document.querySelector("#computer-monitor")?.getBoundingClientRect();
    if (!targetRect) return;

    let currentX = initialPosition.x;
    let currentY = initialPosition.y;

    const animate = () => {
      currentX += velocityX;
      currentY += velocityY;

      // Apply friction to slow down the plane
      velocityX *= 0.55;
      velocityY *= 0.55;

      const isOutOfBounds =
        currentX < 0 || 
        currentX > targetRect.width || 
        currentY < 0 || 
        currentY > targetRect.height;

      if (isOutOfBounds) {
        controls.start({
          x: initialPosition.x,
          y: initialPosition.y,
          transition: { duration: 0.5 },
        });
        onReset();
        return; // Stop animation
      }

      controls.start({
        x: currentX,
        y: currentY,
        transition: { duration: 0.1 },
      });

      // Stop animation when velocity is very low
      if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
        requestAnimationFrame(animate);
      } else {
        // Check if plane is within computer monitor when animation stops
        if (computerMonitorRect) {
          const planeRect = document.querySelector(".paper-plane")?.getBoundingClientRect();
          if (planeRect && 
              planeRect.left >= computerMonitorRect.left &&
              planeRect.right <= computerMonitorRect.right &&
              planeRect.top >= computerMonitorRect.top &&
              planeRect.bottom <= computerMonitorRect.bottom
          ) {
            onScoreUpdate(10);
          }
        }
      }
    };

    animate();
  };

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
          animatePlane(
            dragEnd.x - dragStart.x,
            dragEnd.y - dragStart.y
          );
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

          const targetRect = document.querySelector("#game-container")?.getBoundingClientRect();
          // Container dimensions (matching dragConstraints)
          const containerWidth = targetRect.width;
          const containerHeight = targetRect.height;

          const isOutOfBounds =
            x < 0 || x > containerWidth || y < 0 || y > containerHeight;

          if (isOutOfBounds) {
            controls.start({
              x: initialPosition.x,
              y: initialPosition.y,
              transition: { duration: 0.5 },
            });
            onReset();
          }
        }}
        onDragEnd={(event, info) => {
          const targetRect = document
            .querySelector(".target-circle")
            ?.getBoundingClientRect();
          if (targetRect && event.target instanceof HTMLElement) {
            const planeRect = event.target.getBoundingClientRect();
            if (
              planeRect.left < targetRect.right &&
              planeRect.right > targetRect.left &&
              planeRect.top < targetRect.bottom &&
              planeRect.bottom > targetRect.top
            ) {
              onScoreUpdate(10);
            }
            
            // Use velocity from drag end to animate the plane
            animatePlane(info.velocity.x, info.velocity.y);
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
      <div className="absolute bottom-48 right-32 w-48 h-40 bg-gray-800 rounded-lg p-2" id={"computer-monitor"}>
        <div className="w-full h-full bg-blue-100 rounded-sm flex items-center justify-center">
          <div className="target-circle w-32 h-32 rounded-full border-4 border-dashed border-red-400 opacity-50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 389.75 130.14">
                  <title>Ekopost Logo</title>
                  <g id="ekopost-logo" data-name="Ekopost logo">
                      <path  d="M67.19,104.27c-1.21-8.42,12.47-15.72,32.17-18-22.9,1.17-39.8,8.71-38.51,17.32.94,6.25,11.1,11.5,25.19,14.12C75.3,114.65,68,109.88,67.19,104.27Zm106.51,6.66c23.56-.1,43.5-4.68,43.32-10.15-.07-2.08-2-3.37-4-4.58.45.6,2,2.16,2,3.28-.14,5.42-18.72,9.24-41.54,9.33-23,.09-42.17-3.75-41.92-9,.06-1,1.12-2.42,1.22-2.77-.87.87-2.86,2.27-2.63,4.08C130.67,106.61,149.93,111,173.7,110.93Zm69.89-26.5c25.75,4.6,41.71,11.64,40.93,19.5-1.35,13.52-51.52,24.41-112,24.64-13.17,0-25.79-.4-37.56-1.25a420.25,420.25,0,0,0,50.85,2.82c57.36-.22,105-11,106.42-24.52C293.23,96.73,273.9,88.84,243.59,84.43Zm-3,26.89c-14.41,4.67-37.55,7-65.66,6.78-43.58-.33-79.56-8.15-80.29-17.71-.42-5.28,10.24-10.06,27.56-13.23-20,3.18-32.54,8.4-32.16,14.37.71,9.88,36.58,18,80.19,18.5C201.74,120.31,227.46,117.16,240.55,111.32Zm12.61-7.18c-.2,3.08-3.13,6-8.07,8.61,7.93-3.06,12.64-6.66,12.8-10.43.49-6.75-8.84-11.53-29.65-14.79-5.69-.86-13.5-1.46-13.5-1.46s1.28.18,8.71,1.56C243.1,91.26,253.61,97.5,253.16,104.14Z"></path>
                      <path  d="M38.63,20.8q-5.28-3.5-13.8-3.5a25.2,25.2,0,0,0-13.14,3.31A22.35,22.35,0,0,0,3.07,30,31.66,31.66,0,0,0,0,44.43,34,34,0,0,0,1.87,56.22,21.06,21.06,0,0,0,7.48,64.7a24.22,24.22,0,0,0,9.25,5.13,42.51,42.51,0,0,0,12.7,1.72,43.81,43.81,0,0,0,9-.81,30,30,0,0,0,6.28-2v-9.1H43.9a23,23,0,0,1-5.51,2.06,33.13,33.13,0,0,1-8.29.91A28.08,28.08,0,0,1,20.18,61a13.35,13.35,0,0,1-6.81-5.51A17.12,17.12,0,0,1,11.08,48h37l.09-2.87a36.4,36.4,0,0,0-2-14.52A19.66,19.66,0,0,0,38.63,20.8ZM37.38,40.11H11.08a20.46,20.46,0,0,1,1.72-7,11.5,11.5,0,0,1,5-5.51,14.81,14.81,0,0,1,6.9-1.63q6.33,0,9.49,3.4t3.16,10Zm64.11,25.74q-2.25-2.53-4.17-4.74L81.77,43,97.13,27c.89-.89,1.79-1.8,2.68-2.73s1.76-1.8,2.59-2.63a27.53,27.53,0,0,1,2.2-2V18.45H92.72L71.25,41.71V4.55H59.94l-.19.77A29,29,0,0,1,60.27,10q.15,2.92.19,6c0,2.05,0,3.71,0,5V70.69H71.25V45.21L92.53,70.69H105V69.54Q103.75,68.38,101.49,65.85Zm52-36.18a21.71,21.71,0,0,0-8.68-9.2A25.47,25.47,0,0,0,132,17.3a25.76,25.76,0,0,0-12.89,3.17,21.56,21.56,0,0,0-8.72,9.2,31.83,31.83,0,0,0-3.12,14.76,32.28,32.28,0,0,0,3.07,14.76,21.51,21.51,0,0,0,8.62,9.2,25.91,25.91,0,0,0,13,3.16,25.49,25.49,0,0,0,12.84-3.16,21.83,21.83,0,0,0,8.68-9.2,32,32,0,0,0,3.11-14.76A32,32,0,0,0,153.52,29.67ZM142.16,58.09q-3.54,4.65-10.16,4.65t-10.26-4.65q-3.54-4.65-3.54-13.66,0-9.21,3.54-13.8T132,26q6.62,0,10.16,4.61t3.55,13.8Q145.71,53.44,142.16,58.09Z"></path>
                      <path  d="M380.4,0a9.35,9.35,0,1,0,9.35,9.35A9.33,9.33,0,0,0,380.4,0Zm0,17.25a7.92,7.92,0,0,1-7.9-7.9,7.88,7.88,0,1,1,7.9,7.9Zm4.32-10A3.31,3.31,0,0,0,381.15,4h-4.37V14.73h1.59V10.5h1.76l2.78,4.23h1.94L382,10.45A3.13,3.13,0,0,0,384.72,7.28Zm-6.35,1.85V5.34h2.78a1.85,1.85,0,0,1,1.94,1.94,1.83,1.83,0,0,1-1.94,1.85Zm-116,11.34a27.69,27.69,0,0,0-25.73,0,21.64,21.64,0,0,0-8.73,9.2,32,32,0,0,0-3.11,14.76,32.28,32.28,0,0,0,3.07,14.76,21.51,21.51,0,0,0,8.62,9.2,25.91,25.91,0,0,0,13,3.16,25.49,25.49,0,0,0,12.84-3.16,21.83,21.83,0,0,0,8.68-9.2,32,32,0,0,0,3.11-14.76,32,32,0,0,0-3.11-14.76A21.71,21.71,0,0,0,262.39,20.47Zm-2.68,37.62q-3.56,4.65-10.16,4.65c-4.48,0-7.89-1.55-10.26-4.65s-3.54-7.65-3.54-13.66,1.18-10.74,3.54-13.8S245.07,26,249.55,26s7.79,1.54,10.16,4.61,3.54,7.66,3.54,13.8S262.07,55,259.71,58.09Zm57.22-14.91a28.7,28.7,0,0,0-8.15-2.39L304.27,40A25.56,25.56,0,0,1,297.13,38a4.44,4.44,0,0,1-2.54-4.27A5.69,5.69,0,0,1,298,28.13c2.3-1.08,5.5-1.63,9.59-1.63a36.78,36.78,0,0,1,6.71.58,39.25,39.25,0,0,1,6.42,1.82h.77V19.7a38.78,38.78,0,0,0-6.14-1.44,46.38,46.38,0,0,0-7.38-.57q-8.62,0-13.8,2.25a16.39,16.39,0,0,0-7.57,6,14.79,14.79,0,0,0-2.4,8.15q0,6.22,4,9.53t12,4.65l4.5.77a25.78,25.78,0,0,1,7.34,2.06,4.59,4.59,0,0,1,2.54,4.46,5.76,5.76,0,0,1-1.39,4.07,7.75,7.75,0,0,1-3.5,2.11,19.55,19.55,0,0,1-4.17.77c-1.38.09-2.57.14-3.6.14a40.79,40.79,0,0,1-8.91-1,41.87,41.87,0,0,1-8-2.54h-.76v9.68a57.28,57.28,0,0,0,8,1.92,53.82,53.82,0,0,0,9.21.77q11.88,0,17.68-4.08t5.8-12a12.19,12.19,0,0,0-2.21-7.47A15.31,15.31,0,0,0,316.93,43.18Zm-109-19A23.46,23.46,0,0,0,199.45,19a32.76,32.76,0,0,0-10.88-1.73A50.49,50.49,0,0,0,178,18.45a60.81,60.81,0,0,0-9.82,3l-.19.77a29,29,0,0,1,.52,4.65q.15,2.93.19,5.89c0,2,0,3.55,0,4.7v57.5c0,.82,2.41,1.48,5.37,1.48s5.37-.66,5.37-1.48V70.77l.81.16c1.12.22,2.35.43,3.69.62a26.67,26.67,0,0,0,3.93.29,32.61,32.61,0,0,0,11.74-2,24.18,24.18,0,0,0,8.68-5.56,23.57,23.57,0,0,0,5.37-8.68,33.07,33.07,0,0,0,1.82-11.21,32.58,32.58,0,0,0-2-11.79A22.66,22.66,0,0,0,208,24.16Zm-7.66,34.07q-4.27,4.89-13,4.89a28.41,28.41,0,0,1-4.32-.29,20.67,20.67,0,0,1-2.87-.62l-.67-.2V33.69c0-1.66-.05-3.19-.15-4.6,0-.52-.09-1-.15-1.46a24,24,0,0,1,2.6-.79,24.8,24.8,0,0,1,6-.72q8.15,0,12.46,4.65t4.31,13.66Q204.58,53.34,200.32,58.23ZM364.81,62a17.19,17.19,0,0,1-3.78.43q-5.08,0-7.43-2.3t-2.35-7.57V27.46h14.67v-9H351.25V4.55H339.94l-.19.77a30,30,0,0,1,.53,4.65q.14,2.92.19,6c0,.91,0,1.73,0,2.49h-8.13v9h8.14V53.53a20.61,20.61,0,0,0,2.11,9.73A14,14,0,0,0,349,69.35a25.21,25.21,0,0,0,11,2.11,23.51,23.51,0,0,0,5-.48,22.89,22.89,0,0,0,3.84-1.15V61H368A19.41,19.41,0,0,1,364.81,62Z"></path>
                  </g>
                  
              </svg>
            </div>
            
          </div>
        {/* Monitor stand */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gray-700" />
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gray-600" />
      </div>

    </div>
  );
};

export default GameCanvas;
