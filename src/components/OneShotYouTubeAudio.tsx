
"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';

interface OneShotYouTubeAudioProps {
  videoId: string;
  onPlaybackComplete: () => void;
  volume?: number;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
    ytApiInitializers?: Array<() => void>;
    youtubeApiScriptLoaded?: boolean;
  }
}

const OneShotYouTubeAudio: React.FC<OneShotYouTubeAudioProps> = ({
  videoId,
  onPlaybackComplete,
  volume = 70, // Defaulted to 70 as per usage in ScrollSurferScene
}) => {
  const playerRef = useRef<any>(null);
  const isPlaybackCompletedRef = useRef(false);
  const [actualPlayerDivId, setActualPlayerDivId] = useState<string | null>(null);

  useEffect(() => {
    setActualPlayerDivId(`one-shot-youtube-player-${videoId}-${Math.random().toString(36).substring(7)}`);
  }, [videoId]);

  const internalOnPlaybackComplete = useCallback(() => {
    if (isPlaybackCompletedRef.current) {
      console.log(`OneShotYouTubeAudio (videoId: ${videoId}): internalOnPlaybackComplete called, but already completed.`);
      return;
    }
    console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Playback completed. Firing onPlaybackComplete prop.`);
    isPlaybackCompletedRef.current = true;

    if (onPlaybackComplete) {
      onPlaybackComplete();
    }
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Destroying player instance.`);
      playerRef.current.destroy();
      playerRef.current = null;
    }
  }, [onPlaybackComplete, videoId]);

  const onPlayerReady = useCallback((event: any) => {
    if (isPlaybackCompletedRef.current) {
      console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Player ready, but playback already marked as completed. Aborting play.`);
      return;
    }
    console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Player ready. Attempting to play with volume ${volume}.`);
    try {
      event.target.unMute(); // Attempt to unmute
      console.log(`OneShotYouTubeAudio (videoId: ${videoId}): unMute() called.`);
      event.target.setVolume(volume);
      console.log(`OneShotYouTubeAudio (videoId: ${videoId}): setVolume(${volume}) called.`);
      event.target.playVideo();
      console.log(`OneShotYouTubeAudio (videoId: ${videoId}): playVideo() called.`);
    } catch (e) {
      console.error(`OneShotYouTubeAudio (videoId: ${videoId}): Error during onPlayerReady (unMute/setVolume/playVideo):`, e);
    }
  }, [videoId, volume, isPlaybackCompletedRef]);

  const onPlayerStateChange = useCallback((event: any) => {
    console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Player state changed to: ${event.data}`);
    if (typeof window !== 'undefined' && window.YT) {
      if (event.data === window.YT.PlayerState.PLAYING) {
        console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Player is PLAYING.`);
      } else if (event.data === window.YT.PlayerState.ENDED) {
        console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Player has ENDED.`);
        internalOnPlaybackComplete();
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Player is PAUSED.`);
      } else if (event.data === window.YT.PlayerState.BUFFERING) {
        console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Player is BUFFERING.`);
      } else if (event.data === window.YT.PlayerState.CUED) {
        console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Player is CUED.`);
      }
    }
  }, [videoId, internalOnPlaybackComplete]);
  
  const initializePlayer = useCallback(() => {
    if (!actualPlayerDivId) {
      console.log(`OneShotYouTubeAudio (videoId: ${videoId}): initializePlayer called but actualPlayerDivId is null.`);
      return;
    }

    if (document.getElementById(actualPlayerDivId) && !playerRef.current) {
       console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Initializing new YT.Player for divId: ${actualPlayerDivId}`);
       isPlaybackCompletedRef.current = false; // Reset this flag before creating a new player
      playerRef.current = new window.YT.Player(actualPlayerDivId, {
        height: '0', // Hidden player
        width: '0',  // Hidden player
        videoId: videoId,
        playerVars: {
          // autoplay: 1, // Rely on onPlayerReady to call playVideo()
          controls: 0,
          modestbranding: 1,
          playsinline: 1, // Important for mobile
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': (event: any) => {
            console.error(`OneShotYouTubeAudio Player Error (videoId: ${videoId}, divId: ${actualPlayerDivId}):`, event.data);
            // Do not call internalOnPlaybackComplete here on error, 
            // let it try to finish or be cleaned up by parent.
          }
        },
      });
    } else {
      if (!document.getElementById(actualPlayerDivId)) {
        console.warn(`OneShotYouTubeAudio (videoId: ${videoId}): Div with ID ${actualPlayerDivId} not found in DOM for player initialization.`);
      }
      if (playerRef.current) {
        console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Player already exists for divId: ${actualPlayerDivId}. Not re-initializing.`);
      }
    }
  }, [videoId, onPlayerReady, onPlayerStateChange, actualPlayerDivId]);


  useEffect(() => {
    if (!actualPlayerDivId) return; 

    const loadYouTubeAPI = () => {
      console.log(`OneShotYouTubeAudio (videoId: ${videoId}, divId: ${actualPlayerDivId}): Attempting to load YouTube API.`);
      if (!window.ytApiInitializers) {
        window.ytApiInitializers = [];
        console.log(`OneShotYouTubeAudio: Initialized window.ytApiInitializers array.`);
      }
      const initializerFunctionName = `ytInitializer_${actualPlayerDivId.replace(/-/g, '_')}`;
      
      const currentInitializePlayer = initializePlayer; // Capture current initializePlayer
      const namedInitializer = {
        [initializerFunctionName]: () => {
          console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Executing initializer ${initializerFunctionName}`);
          currentInitializePlayer();
        }
      }[initializerFunctionName];
      
      if (!window.ytApiInitializers.find(fn => fn.name === initializerFunctionName)) {
        window.ytApiInitializers.push(namedInitializer);
        console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Pushed ${initializerFunctionName} to queue. Queue length: ${window.ytApiInitializers.length}`);
      }

      if (window.YT && window.YT.Player) { 
         console.log(`OneShotYouTubeAudio (videoId: ${videoId}): YouTube API already loaded. Attempting to run initializer ${initializerFunctionName} if player not yet created.`);
         const existingInitializer = window.ytApiInitializers.find(fn => fn.name === initializerFunctionName);
         if (existingInitializer && !playerRef.current) { 
            try {
              existingInitializer();
            } catch (e) {
              console.error(`OneShotYouTubeAudio (videoId: ${videoId}): Error executing existing YT API initializer:`, e);
            }
         }
        return;
      }

      if (!window.youtubeApiScriptLoaded) {
        window.youtubeApiScriptLoaded = true; 
        console.log(`OneShotYouTubeAudio: Setting youtubeApiScriptLoaded to true. Loading API script.`);
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag); 
        }

        window.onYouTubeIframeAPIReady = () => {
          console.log(`OneShotYouTubeAudio: Global onYouTubeIframeAPIReady fired. Processing ${window.ytApiInitializers?.length || 0} initializers.`);
          if (window.ytApiInitializers && Array.isArray(window.ytApiInitializers)) {
            window.ytApiInitializers.forEach(initFunc => {
              try {
                console.log(`OneShotYouTubeAudio: Calling queued initializer: ${initFunc.name}`);
                initFunc();
              } catch (e) {
                console.error("OneShotYouTubeAudio: Error executing YT API initializer from global callback:", e);
              }
            });
          }
        };
      } else {
        console.log(`OneShotYouTubeAudio (videoId: ${videoId}): YouTube API script already loaded or loading. Waiting for onYouTubeIframeAPIReady.`);
      }
    };

    if (typeof window !== 'undefined') {
      loadYouTubeAPI();
    }

    return () => {
      console.log(`OneShotYouTubeAudio (videoId: ${videoId}, divId: ${actualPlayerDivId}): Cleanup effect running.`);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Destroying player in cleanup.`);
        playerRef.current.destroy();
      }
      playerRef.current = null;
      if (window.ytApiInitializers && actualPlayerDivId) {
        const initializerFunctionName = `ytInitializer_${actualPlayerDivId.replace(/-/g, '_')}`;
        const idx = window.ytApiInitializers.findIndex(fn => fn.name === initializerFunctionName);
        if (idx > -1) {
          window.ytApiInitializers.splice(idx, 1);
          console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Removed ${initializerFunctionName} from queue during cleanup. Queue length: ${window.ytApiInitializers.length}`);
        }
      }
    };
  }, [videoId, initializePlayer, actualPlayerDivId]); 

  if (!actualPlayerDivId) {
    console.log(`OneShotYouTubeAudio (videoId: ${videoId}): actualPlayerDivId is null, rendering null.`);
    return null; 
  }

  console.log(`OneShotYouTubeAudio (videoId: ${videoId}): Rendering div with ID ${actualPlayerDivId}.`);
  return (
    <div id={actualPlayerDivId} style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1px', height: '1px' }} />
  );
};

export default OneShotYouTubeAudio;
