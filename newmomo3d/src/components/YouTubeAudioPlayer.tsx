
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import Lottie from 'lottie-react';

interface YouTubeAudioPlayerProps {
  videoId: string;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
    ytApiInitializers?: Array<() => void>;
    youtubeApiScriptLoaded?: boolean;
  }
}

const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({ videoId }) => {
  const playerRef = useRef<any>(null); // YT.Player
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actualPlayerDivId, setActualPlayerDivId] = useState<string | null>(null);

  useEffect(() => {
    setActualPlayerDivId(`youtube-player-${videoId}-${Math.random().toString(36).substring(7)}`);
  }, [videoId]);

  const onPlayerReady = useCallback((event: any) => {
    setIsPlayerReady(true);
    event.target.playVideo();
    event.target.setVolume(8);
  }, []);

  const onPlayerStateChange = useCallback((event: any) => {
    if (typeof window !== 'undefined' && window.YT) {
      if (event.data === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
      } else if (
        event.data === window.YT.PlayerState.PAUSED ||
        event.data === window.YT.PlayerState.ENDED
      ) {
        setIsPlaying(false);
      }
    }
  }, []);

  const initializePlayer = useCallback(() => {
    if (!actualPlayerDivId) return;

    if (document.getElementById(actualPlayerDivId) && !playerRef.current) {
      console.log(`YouTubeAudioPlayer (videoId: ${videoId}): Initializing new YT.Player for divId: ${actualPlayerDivId}`);
      playerRef.current = new window.YT.Player(actualPlayerDivId, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          loop: 1,
          playlist: videoId,
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': (event: any) => console.error(`YouTubeAudioPlayer Error (videoId: ${videoId}, divId: ${actualPlayerDivId}):`, event.data),
        },
      });
    } else {
      if (!document.getElementById(actualPlayerDivId)) {
        console.warn(`YouTubeAudioPlayer (videoId: ${videoId}): Div with ID ${actualPlayerDivId} not found in DOM for player initialization.`);
      }
      if (playerRef.current) {
        console.log(`YouTubeAudioPlayer (videoId: ${videoId}): Player already exists for divId: ${actualPlayerDivId}. Not re-initializing.`);
      }
    }
  }, [videoId, onPlayerReady, onPlayerStateChange, actualPlayerDivId]);

  useEffect(() => {
    if (!actualPlayerDivId) return;

    const loadYouTubeAPI = () => {
      console.log(`YouTubeAudioPlayer (videoId: ${videoId}, divId: ${actualPlayerDivId}): Attempting to load YouTube API.`);
      if (!window.ytApiInitializers) {
        window.ytApiInitializers = [];
        console.log(`YouTubeAudioPlayer: Initialized window.ytApiInitializers array.`);
      }
      const initializerFunctionName = `ytInitializer_${actualPlayerDivId.replace(/-/g, '_')}`;
      
      const currentInitializePlayer = initializePlayer;
      const namedInitializer = {
        [initializerFunctionName]: () => {
          console.log(`YouTubeAudioPlayer (videoId: ${videoId}): Executing initializer ${initializerFunctionName}`);
          currentInitializePlayer();
        }
      }[initializerFunctionName];
      
      if (!window.ytApiInitializers.find(fn => fn.name === initializerFunctionName)) {
        window.ytApiInitializers.push(namedInitializer);
        console.log(`YouTubeAudioPlayer (videoId: ${videoId}): Pushed ${initializerFunctionName} to queue. Queue length: ${window.ytApiInitializers.length}`);
      }

      if (window.YT && window.YT.Player) { 
         console.log(`YouTubeAudioPlayer (videoId: ${videoId}): YouTube API already loaded. Attempting to run initializer ${initializerFunctionName} if player not yet created.`);
         const existingInitializer = window.ytApiInitializers.find(fn => fn.name === initializerFunctionName);
         if (existingInitializer && !playerRef.current) { 
            try {
              existingInitializer();
            } catch (e) {
              console.error(`YouTubeAudioPlayer (videoId: ${videoId}): Error executing existing YT API initializer:`, e);
            }
         }
        return;
      }

      if (!window.youtubeApiScriptLoaded) {
        window.youtubeApiScriptLoaded = true; 
        console.log(`YouTubeAudioPlayer: Setting youtubeApiScriptLoaded to true. Loading API script.`);
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag); 
        }

        window.onYouTubeIframeAPIReady = () => {
          console.log(`YouTubeAudioPlayer: Global onYouTubeIframeAPIReady fired. Processing ${window.ytApiInitializers?.length || 0} initializers.`);
          if (window.ytApiInitializers && Array.isArray(window.ytApiInitializers)) {
            window.ytApiInitializers.forEach(initFunc => {
              try {
                console.log(`YouTubeAudioPlayer: Calling queued initializer: ${initFunc.name}`);
                initFunc();
              } catch (e) {
                console.error("YouTubeAudioPlayer: Error executing YT API initializer from global callback:", e);
              }
            });
          }
        };
      } else {
        console.log(`YouTubeAudioPlayer (videoId: ${videoId}): YouTube API script already loaded or loading. Waiting for onYouTubeIframeAPIReady.`);
      }
    };

    if (typeof window !== 'undefined') {
       loadYouTubeAPI();
    }

    return () => {
      console.log(`YouTubeAudioPlayer (videoId: ${videoId}, divId: ${actualPlayerDivId}): Cleanup effect running.`);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        console.log(`YouTubeAudioPlayer (videoId: ${videoId}): Destroying player in cleanup.`);
        playerRef.current.destroy();
      }
      playerRef.current = null;
      if (window.ytApiInitializers && actualPlayerDivId) {
        const initializerFunctionName = `ytInitializer_${actualPlayerDivId.replace(/-/g, '_')}`;
        const idx = window.ytApiInitializers.findIndex(fn => fn.name === initializerFunctionName);
        if (idx > -1) {
          window.ytApiInitializers.splice(idx, 1);
          console.log(`YouTubeAudioPlayer (videoId: ${videoId}): Removed ${initializerFunctionName} from queue during cleanup. Queue length: ${window.ytApiInitializers.length}`);
        }
      }
    };
  }, [videoId, initializePlayer, actualPlayerDivId]);

  const togglePlayPause = () => {
    if (!isPlayerReady || !playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  if (!actualPlayerDivId) {
    return null; 
  }

  return (
    <>
      <div id={actualPlayerDivId} style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1px', height: '1px' }} />
      <div className="fixed bottom-8 left-16 z-50 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          disabled={!isPlayerReady} 
          className="bg-background/70 hover:bg-background/90 text-foreground hover:text-primary rounded-full shadow-lg backdrop-blur-sm"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        {isPlayerReady && isPlaying && (
          <div>
            <Lottie
              path="/lotties/SoundWaves.json"
              loop={true}
              autoplay={true}
              style={{ width: 150, height: 60 }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default YouTubeAudioPlayer;
