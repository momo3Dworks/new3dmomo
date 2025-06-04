
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGlitch } from 'react-powerglitch';

interface PlanetInfoBoxProps {
  isVisible: boolean;
}

const videoUrls = [
  "https://www.youtube.com/watch?v=Euc3FUtl__g",
  "https://www.youtube.com/watch?v=Dyrlr9xxfkU",
  "https://www.youtube.com/watch?v=Bgl13btuuFQ",
  "https://www.youtube.com/watch?v=rCEg3EGWzZE"
];

function getVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const videoIds = videoUrls.map(getVideoId).filter(id => id !== null) as string[];

const PlanetInfoBox = React.forwardRef<HTMLDivElement, PlanetInfoBoxProps>(
  ({ isVisible }, ref) => {
    const glitch = useGlitch({
      playMode: 'manual', // Changed from 'always'
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

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    useEffect(() => {
      if (isVisible) {
        glitch.startGlitch();
      } else {
        glitch.stopGlitch();
      }
    }, [isVisible, glitch]);

    const handleNextVideo = () => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoIds.length);
    };

    const handlePrevVideo = () => {
      setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + videoIds.length) % videoIds.length);
    };

    const handleMouseEnter = () => {
      if (isVisible) {
        glitch.stopGlitch();
      }
    };

    const handleMouseLeave = () => {
      if (isVisible) {
        glitch.startGlitch();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-1/2 right-8 transform -translate-y-1/2 z-10 transition-all duration-500 ease-in-out",
          "w-auto",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}
        aria-hidden={!isVisible}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative p-3 border border-accent/30 rounded-lg shadow-[0_0_15px_hsl(var(--accent)/0.3)] bg-transparent">
          <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-accent rounded-tl-lg"></div>
          <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-accent rounded-tr-lg"></div>
          <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-accent rounded-bl-lg"></div>
          <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-accent rounded-br-lg"></div>

          <Card
            ref={glitch.ref}
            className="relative bg-card/60 backdrop-blur-sm shadow-2xl overflow-hidden w-96 md:w-[28rem]"
          >
            <img
              src="/images/White_noise.gif"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
            />
            <CardHeader className="pb-3 relative z-10 items-center">
              <CardTitle className="text-2xl font-bold text-primary-foreground text-holographic">Render Animations</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              {videoIds.length > 0 ? (
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoIds[currentVideoIndex]}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoIds[currentVideoIndex]}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="rounded-md shadow-lg"
                  ></iframe>
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-holographic">No videos available.</p>
              )}
              {videoIds.length > 1 && (
                <div className="flex justify-between items-center mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevVideo}
                    className="bg-accent/30 hover:bg-accent/50 border-accent/50 text-accent-foreground"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Previous Video</span>
                  </Button>
                  <p className="text-sm text-muted-foreground text-holographic">
                    Video {currentVideoIndex + 1} of {videoIds.length}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextVideo}
                    className="bg-accent/30 hover:bg-accent/50 border-accent/50 text-accent-foreground"
                  >
                    <ChevronRight className="h-5 w-5" />
                    <span className="sr-only">Next Video</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
);

PlanetInfoBox.displayName = 'PlanetInfoBox';

export default PlanetInfoBox;

