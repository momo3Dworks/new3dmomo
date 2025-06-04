
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SatelliteDish, Users, Wrench, ShieldAlert } from 'lucide-react';
import { useGlitch } from 'react-powerglitch';

interface StationInfoBoxProps {
  isVisible: boolean;
}

const StationInfoBox = React.forwardRef<HTMLDivElement, StationInfoBoxProps>(
  ({ isVisible }, ref) => {
    const glitch = useGlitch({
      playMode: 'always',
      createContainers: true,
      hideOverflow: false,
      timing: {
        duration: 3000,
        iterations: Infinity,
      },
      glitchTimeSpan: {
        start: 0.0,
        end: 0.7,
      },
      shake: {
        velocity: 12,
        amplitudeX: 0.08,
        amplitudeY: 0.08,
      },
      slice: {
        count: 5,
        velocity: 10,
        minHeight: 0.01,
        maxHeight: 0.08,
        hueRotate: true,
      },
      pulse: false,
    });

    return (
      <div
        ref={ref} // Forwarded ref applied here
        className={cn(
          "fixed top-1/2 left-8 transform -translate-y-1/2 z-10 transition-all duration-500 ease-in-out",
          "w-auto",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
        )}
        aria-hidden={!isVisible}
      >
        <div className="relative p-3 border border-accent/30 rounded-lg shadow-[0_0_15px_hsl(var(--accent)/0.3)] bg-transparent">
          {/* HUD Corner Brackets */}
          <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-accent rounded-tl-lg"></div>
          <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-accent rounded-tr-lg"></div>
          <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-accent rounded-bl-lg"></div>
          <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-accent rounded-br-lg"></div>

          <Card
            ref={glitch.ref}
            className="relative bg-card/60 backdrop-blur-sm shadow-2xl overflow-hidden w-72 md:w-80"
          >
            <img
              src="/images/White_noise.gif"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
            />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center space-x-3">
                <SatelliteDish className="h-8 w-8 text-accent text-holographic" />
                <CardTitle className="text-xl font-bold text-primary-foreground text-holographic">Starbase Omega-7</CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground pt-1 text-holographic">
                Trade hub and refueling station.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm relative z-10">
              <div className="flex items-start space-x-2">
                <Users size={18} className="text-primary flex-shrink-0 mt-0.5 text-holographic" />
                <p className="text-holographic"><strong className="font-semibold text-foreground/90">Population:</strong> ~1.5 million (transient)</p>
              </div>
              <div className="flex items-start space-x-2">
                <Wrench size={18} className="text-primary flex-shrink-0 mt-0.5 text-holographic" />
                <p className="text-holographic"><strong className="font-semibold text-foreground/90">Services:</strong> Ship repair, provisions, trade.</p>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldAlert size={18} className="text-destructive flex-shrink-0 mt-0.5 text-holographic" />
                <p className="text-holographic"><strong className="font-semibold text-foreground/90">Alert:</strong> Pirate activity reported in sector.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
);

StationInfoBox.displayName = 'StationInfoBox'; // Required for forwardRef

export default StationInfoBox;
