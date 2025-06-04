
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

const TechHudOverlay: React.FC = () => {
  const accentColor = 'hsl(var(--accent))'; // Using CSS variable for accent color

  return (
    <div
      className={cn(
        "fixed inset-0 z-10 flex items-center justify-center pointer-events-none",
        "text-[hsl(var(--accent))] " // Main color for text elements
      )}
    >
      {/* Main Frame Container - for overall positioning and padding */}
      <div className="absolute inset-4"> {/* Changed from inset-4 sm:inset-8 */}
        {/* Top Border */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5" // Changed from left-4 right-4
          style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
        ></div>
        {/* Bottom Border */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5" // Changed from left-4 right-4
          style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
        ></div>
        {/* Left Border */}
        <div
          className="absolute top-0 bottom-0 left-0 w-0.5" // Changed from top-4 bottom-4
          style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
        ></div>
        {/* Right Border */}
        <div
          className="absolute top-0 bottom-0 right-0 w-0.5" // Changed from top-4 bottom-4
          style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
        ></div>

        {/* Corner Elements (Chamfer effect and details) */}
        {/* Top-Left Corner */}
        <div className="absolute top-0 left-0 w-8 h-8">
          <div className="absolute top-0 left-0 w-4 h-0.5" style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}></div> {/* Horizontal part of L, changed from left-4 */}
          <div className="absolute top-0 left-0 w-0.5 h-4" style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}></div> {/* Vertical part of L, changed from top-4 */}
          {/* Plus marker */}
          <div className="absolute top-1 left-1 w-3 h-0.5 bg-current opacity-70 transform translate-x-1 translate-y-1"></div>
          <div className="absolute top-1 left-1 w-0.5 h-3 bg-current opacity-70 transform translate-x-1 translate-y-1"></div>
          {/* Angled shapes */}
          <div className="absolute top-1 left-6 w-3 h-1 -skew-x-[30deg]" style={{ backgroundColor: accentColor, opacity: 0.7 }}></div>
          <div className="absolute top-1 left-9 w-3 h-1 -skew-x-[30deg]" style={{ backgroundColor: accentColor, opacity: 0.5 }}></div>
        </div>

        {/* Top-Right Corner */}
        <div className="absolute top-0 right-0 w-8 h-8">
          <div className="absolute top-0 right-0 w-4 h-0.5" style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}></div> {/* Changed from right-4 */}
          <div className="absolute top-0 right-0 w-0.5 h-4" style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}></div> {/* Changed from top-4 */}
           {/* Plus marker */}
          <div className="absolute top-1 right-1 w-3 h-0.5 bg-current opacity-70 transform -translate-x-1 translate-y-1"></div>
          <div className="absolute top-1 right-1 w-0.5 h-3 bg-current opacity-70 transform -translate-x-1 translate-y-1"></div>
          {/* Filled chamfer */}
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4" style={{ backgroundColor: accentColor, clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)', opacity:0.8 }}></div>
        </div>

        {/* Bottom-Left Corner */}
        <div className="absolute bottom-0 left-0 w-8 h-8">
          <div className="absolute bottom-0 left-0 w-4 h-0.5" style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}></div> {/* Changed from left-4 */}
          <div className="absolute bottom-0 left-0 w-0.5 h-4" style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}></div> {/* Changed from bottom-4 */}
           {/* Plus marker */}
          <div className="absolute bottom-1 left-1 w-3 h-0.5 bg-current opacity-70 transform translate-x-1 -translate-y-1"></div>
          <div className="absolute bottom-1 left-1 w-0.5 h-3 bg-current opacity-70 transform translate-x-1 -translate-y-1"></div>
        </div>

        {/* Bottom-Right Corner */}
        <div className="absolute bottom-0 right-0 w-8 h-8">
          <div className="absolute bottom-0 right-0 w-4 h-0.5" style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}></div> {/* Changed from right-4 */}
          <div className="absolute bottom-0 right-0 w-0.5 h-4" style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}></div> {/* Changed from bottom-4 */}
           {/* Plus marker */}
          <div className="absolute bottom-1 right-1 w-3 h-0.5 bg-current opacity-70 transform -translate-x-1 -translate-y-1"></div>
          <div className="absolute bottom-1 right-1 w-0.5 h-3 bg-current opacity-70 transform -translate-x-1 -translate-y-1"></div>
          {/* Dots */}
          <div className="absolute bottom-2 right-6 w-1 h-1 rounded-full bg-current opacity-70"></div>
          <div className="absolute bottom-2 right-8 w-1 h-1 rounded-full bg-current opacity-70"></div>
        </div>

        {/* Top "Progress Bar" like element */}
        <div className="absolute top-2 left-1/4 w-1/2 sm:w-1/3 h-2 flex items-center">
          <div className="w-full h-1 bg-current opacity-30 rounded-full">
            <div className="w-3/4 h-full bg-current opacity-80 rounded-full" style={{boxShadow: `0 0 5px ${accentColor}`}}></div>
          </div>
        </div>
        
        {/* Bottom Angled Shapes */}
        <div className="absolute bottom-1 left-1/4 w-auto flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={`bottom-shape-${i}`} className="w-4 h-1.5 -skew-x-[30deg]" style={{ backgroundColor: accentColor, opacity: 0.6 - i * 0.05 }}></div>
          ))}
        </div>

        {/* Small Circle/Reticle Elements - simplified */}
        <div className="absolute top-1/3 right-2 w-3 h-3 border border-current rounded-full opacity-50">
             <div className="w-0.5 h-full bg-current mx-auto"></div>
             <div className="w-full h-0.5 bg-current my-auto absolute top-1/2 left-0 -translate-y-1/2"></div>
        </div>
        <div className="absolute bottom-1/3 left-2 w-3 h-3 border border-current rounded-full opacity-50">
            <div className="w-0.5 h-full bg-current mx-auto"></div>
             <div className="w-full h-0.5 bg-current my-auto absolute top-1/2 left-0 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default TechHudOverlay;
