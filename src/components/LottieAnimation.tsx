
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  className,
  width = 56,
  height = 56,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const clearExistingTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const startTimeout = () => {
      clearExistingTimeout();
      timeoutRef.current = setTimeout(() => {
        if (typeof window !== 'undefined' && window.scrollY === 0) {
          setIsVisible(false);
        }
      }, 10000); 
    };

    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > 0) {
          setIsVisible(false);
          clearExistingTimeout();
        } else { 
          setIsVisible(true);
          startTimeout();
        }
      }
    };

    if (typeof window !== 'undefined') {
      if (window.scrollY === 0) {
        setIsVisible(true);
        startTimeout();
      } else {
        setIsVisible(false);
      }
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
      clearExistingTimeout();
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .animate-fade-opacity {
          animation: fadeOpacity 2.5s infinite ease-in-out;
        }
        @keyframes fadeOpacity {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div
        className={className}
        style={{
          position: 'fixed',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 400ms ease-out',
        }}
      >
        <Lottie
          path="/lotties/ScrollDown.json"
          loop={true}
          autoplay={true}
          style={{ width, height }}
        />
        <p
          className="animate-fade-opacity"
          style={{
            marginTop: '8px',
            color: 'hsl(var(--foreground))',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          Scroll Down to enjoy the journey
        </p>
      </div>
    </>
  );
};

export default LottieAnimation;
