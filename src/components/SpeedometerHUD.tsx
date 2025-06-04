
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SpeedometerHUDProps {
  currentSpeed: number;
  maxSpeed: number; // Max speed for the gauge scale
  className?: string;
}

const SpeedometerHUD: React.FC<SpeedometerHUDProps> = ({
  currentSpeed,
  maxSpeed,
  className,
}) => {
  const svgSize = 200; // ViewBox size for the square SVG
  const strokeWidth = 14; // Width of the gauge arcs
  const radius = svgSize / 2 - strokeWidth; // Radius for the centerline of the arc
  
  const angleRange = 260; // Visual sweep of the gauge
  const angleOffset = 140; // Starting angle of the gauge arc

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = angleInDegrees * Math.PI / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, currentAngleDeg: number) => {
    const effectiveStartAngle = angleOffset;
    const effectiveEndAngle = Math.min(angleOffset + angleRange, Math.max(angleOffset, currentAngleDeg));

    const start = polarToCartesian(cx, cy, r, effectiveStartAngle);
    const end = polarToCartesian(cx, cy, r, effectiveEndAngle);

    const largeArcFlag = (effectiveEndAngle - effectiveStartAngle) <= 180 ? "0" : "1";
    
    const d = [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");
    return d;
  };

  const percentage = Math.min(Math.max(currentSpeed, 0), maxSpeed) / maxSpeed;
  const currentGaugeAngle = angleOffset + percentage * angleRange;

  const backgroundArcD = describeArc(svgSize / 2, svgSize / 2, radius, angleOffset + angleRange);
  const speedArcD = describeArc(svgSize / 2, svgSize / 2, radius, currentGaugeAngle);

  const numTicks = 10; // Creates 11 tick marks (0 to 10)
  const ticks = Array.from({ length: numTicks + 1 }).map((_, i) => {
    const tickPercentage = i / numTicks;
    const angle = angleOffset + tickPercentage * angleRange;
    const pOuter = polarToCartesian(svgSize / 2, svgSize / 2, radius + strokeWidth / 2 + 3, angle);
    const pInner = polarToCartesian(svgSize / 2, svgSize / 2, radius - strokeWidth / 2 - 3, angle);
    const textAnchorPos = polarToCartesian(svgSize / 2, svgSize / 2, radius + strokeWidth /2 + 15, angle);
    const speedLabel = Math.round(tickPercentage * maxSpeed);

    return {
      x1: pInner.x, y1: pInner.y, x2: pOuter.x, y2: pOuter.y,
      textX: textAnchorPos.x, textY: textAnchorPos.y,
      label: speedLabel,
      showLabel: i % 2 === 0 || i === numTicks || i === 0, // Show for 0, last, and every other
    };
  });

  return (
    <div className={cn("fixed bottom-6 right-6 w-[280px] h-[210px] z-20 pointer-events-none", className)}>
      <div className="relative w-full h-full">
        <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full h-full absolute inset-0 overflow-visible">
          {/* Background Arc */}
          <path
            d={backgroundArcD}
            stroke="hsl(30, 70%, 25%)" // Darker orange
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {/* Speed Arc - only draw if speed > 0 to avoid tiny dot at start */}
          {currentSpeed > 0.1 && (
            <path
              d={speedArcD}
              stroke="hsl(30, 100%, 50%)" // Bright Orange
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              // Removed: style={{ transition: 'd 0.3s ease-out' }}
            />
          )}

          {/* Ticks and Labels */}
          {ticks.map((tick, i) => (
            <React.Fragment key={`tick-${i}`}>
              <line 
                x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} 
                stroke="hsl(30, 50%, 60%)" // Medium orange
                strokeWidth="1.5" 
              />
              {tick.showLabel && (
                 <text
                    x={tick.textX}
                    y={tick.textY}
                    fill="hsl(30, 70%, 70%)" // Light orange for SVG text
                    fontSize="9"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    // text-holographic doesn't directly apply to SVG text elements like HTML
                  >
                    {tick.label}
                  </text>
              )}
            </React.Fragment>
          ))}
        </svg>

        {/* Speed Value & Text - Positioned more centrally relative to the overall box */}
        <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div 
            className="text-7xl font-bold text-holographic" 
            style={{ color: 'hsl(30, 100%, 60%)' }} // Bright Red-Orange base for HTML text
          >
            {Math.round(currentSpeed)}
          </div>
          <div 
            className="text-sm text-holographic mt-1" 
            style={{ color: 'hsl(30, 90%, 75%)' }} // Lighter Orange base for HTML text
          >
            WARP
          </div>
        </div>

        {/* Decorative HUD elements */}
        <div 
            className="absolute top-[30%] left-1 text-xs text-holographic opacity-60"
            style={{ color: 'hsl(30, 80%, 70%)' }} // Warm tint for side labels
        >
          <p className="mb-1">LEVEL</p>
          <p className="mb-8 font-semibold">HIGH</p>
          <p className="font-semibold">LOW</p>
        </div>

        <div 
            className="absolute top-[30%] right-1 text-xs text-holographic opacity-60 text-right"
            style={{ color: 'hsl(30, 80%, 70%)' }} // Warm tint for side labels
        >
           <p className="mb-1">MODE</p>
          <p className="mb-8 font-semibold">ECO</p>
          <p className="font-semibold">SPORT</p>
        </div>
         <div className="absolute top-[53%] right-[22px] text-xs opacity-90">
          <span className="inline-block px-2 py-0.5 bg-[hsl(30,80%,50%)] text-white rounded text-[10px] text-holographic">NORMAL</span>
        </div>
      </div>
    </div>
  );
};

export default SpeedometerHUD;

