
"use client";

import React from 'react';
import Link from 'next/link';
import { X as TwitterIcon, Menu as MenuIcon } from 'lucide-react';
import { useGlitch } from 'react-powerglitch';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const PlaceholderLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="120" height="45" viewBox="0 0 257 122"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("fill-current text-primary", className)}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M216.936 6L108.582 6.60465V6.60942L7 6.60942L7 22.2433L83.9311 22.2433L45.3881 39.8895L45.3881 52.8919L84.0859 70.538L7 70.538V86.1719H111L111.001 86.1768L111.844 86.1719H115.354V86.1516L216.936 85.5625V73.3647C218.626 73.6029 220.4 73.722 222.257 73.722C227.994 73.722 232.937 72.5853 237.086 70.3118C241.235 68.0383 244.437 64.7659 246.691 60.4945C248.944 56.2919 250.071 51.2283 250.071 45.3034C250.071 39.4474 248.944 34.3838 246.691 30.1123C244.437 25.8409 241.235 22.5685 237.086 20.295C232.937 18.0215 227.994 16.8848 222.257 16.8848C220.4 16.8848 218.626 17.0039 216.936 17.2421V6ZM146.318 30.1123C144.473 26.6174 141.995 23.7912 138.882 21.6339L185.513 21.6339L149.095 38.3072C148.545 35.3112 147.619 32.5796 146.318 30.1123ZM146.318 60.4944C147.499 58.2919 148.37 55.8529 148.933 53.1773L185.668 69.9286L137.388 69.9286C141.211 67.6763 144.187 64.5315 146.318 60.4944ZM196.658 32.6411L168.022 45.7812L197.155 59.1492C195.347 55.2245 194.443 50.6093 194.443 45.3034C194.443 40.5636 195.182 36.3429 196.658 32.6411ZM207.275 57.8076C203.843 54.6385 202.127 50.4704 202.127 45.3034C202.127 40.0675 203.843 35.865 207.275 32.6959C210.758 29.5956 215.752 28.0455 222.257 28.0455C228.763 28.0455 233.731 29.5956 237.163 32.6959C240.646 35.865 242.388 40.0675 242.388 45.3034C242.388 50.4704 240.646 54.6385 237.163 57.8076C233.731 60.9767 228.763 62.5613 222.257 62.5613C215.752 62.5613 210.758 60.9767 207.275 57.8076ZM96.2585 32.708L66.4397 46.3907L97.5398 60.6613C97.51 60.6058 97.4804 60.5502 97.451 60.4944C95.1972 56.2919 94.0703 51.2282 94.0703 45.3034C94.0703 40.5921 94.7997 36.3937 96.2585 32.708ZM106.902 57.8076C103.47 54.6385 101.754 50.4704 101.754 45.3034C101.754 40.0675 103.47 35.865 106.902 32.6959C110.385 29.5956 115.379 28.0455 121.884 28.0455C128.39 28.0455 133.358 29.5956 136.79 32.6959C140.273 35.865 142.015 40.0675 142.015 45.3034C142.015 50.4704 140.273 54.6385 136.79 57.8076C133.358 60.9767 128.39 62.5613 121.884 62.5613C115.379 62.5613 110.385 60.9767 106.902 57.8076ZM7.1123 106.686V91.0234H9.6183L12.8627 98.0939L16.107 91.0234H18.613V106.686H16.3531V95.5432L13.8024 101.137H11.9229L9.37217 95.5656V106.686H7.1123ZM160.587 106.686V91.0234H163.093L166.337 98.0939L169.582 91.0234H172.088V106.686H169.828V95.5432L167.277 101.137H165.397L162.847 95.5656V106.686H160.587ZM243.074 106.955C242.015 106.955 241.068 106.717 240.233 106.239C239.398 105.762 238.741 105.091 238.264 104.226C237.787 103.345 237.548 102.316 237.548 101.138C237.548 99.9594 237.787 98.9376 238.264 98.0724C238.741 97.1923 239.398 96.5136 240.233 96.0363C241.068 95.559 242.023 95.3203 243.097 95.3203C244.171 95.3203 245.118 95.559 245.938 96.0363C246.774 96.5136 247.423 97.1923 247.885 98.0724C248.362 98.9376 248.601 99.9594 248.601 101.138C248.601 102.316 248.362 103.345 247.885 104.226C247.408 105.091 246.751 105.762 245.916 106.239C245.096 106.717 244.148 106.955 243.074 106.955ZM243.074 104.695C243.641 104.695 244.163 104.569 244.641 104.315C245.118 104.061 245.498 103.674 245.782 103.152C246.08 102.615 246.229 101.943 246.229 101.138C246.229 100.317 246.08 99.6461 245.782 99.1241C245.498 98.602 245.118 98.2141 244.641 97.9606C244.178 97.707 243.664 97.5802 243.097 97.5802C242.53 97.5802 242.008 97.707 241.531 97.9606C241.053 98.2141 240.665 98.602 240.367 99.1241C240.084 99.6461 239.942 100.317 239.942 101.138C239.942 102.361 240.248 103.263 240.859 103.845C241.486 104.412 242.224 104.695 243.074 104.695ZM86.7582 106.239C87.5936 106.717 88.5408 106.955 89.5998 106.955C90.6738 106.955 91.621 106.717 92.4415 106.239C93.2768 105.762 93.9331 105.091 94.4105 104.226C94.8878 103.345 95.1264 102.316 95.1264 101.138C95.1264 99.9594 94.8878 98.9376 94.4105 98.0724C93.948 97.1923 93.2992 96.5136 92.4638 96.0363C91.6434 95.559 90.6962 95.3203 89.6222 95.3203C88.5482 95.3203 87.5936 95.559 86.7582 96.0363C85.9229 96.5136 85.2666 97.1923 84.7892 98.0724C84.3119 98.9376 84.0732 99.9594 84.0732 101.138C84.0732 102.316 84.3119 103.345 84.7892 104.226C85.2666 105.091 85.9229 105.762 86.7582 106.239ZM91.1661 104.315C90.6888 104.569 90.1667 104.695 89.5998 104.695C88.7496 104.695 88.0112 104.412 87.3847 103.845C86.7731 103.263 86.4674 102.361 86.4674 101.138C86.4674 100.317 86.6091 99.6461 86.8925 99.1241C87.1908 98.602 87.5786 98.2141 88.056 97.9606C88.5333 97.707 89.0554 97.5802 89.6222 97.5802C90.189 97.5802 90.7037 97.707 91.1661 97.9606C91.6434 98.2141 92.0238 98.602 92.3072 99.1241C92.6055 99.6461 92.7547 100.317 92.7547 101.138C92.7547 101.943 92.6055 102.615 92.3072 103.152C92.0238 103.674 91.6434 104.061 91.1661 104.315Z" fill="white"/>
<circle cx="53.6315" cy="100.632" r="1.63151" fill="white"/>
<circle cx="128.68" cy="100.632" r="1.63151" fill="white"/>
<circle cx="208.857" cy="100.632" r="1.63151" fill="white"/>
  </svg>
);

// Options for the useGlitch hook
const useGlitchOptions = {
  playMode: "hover" as const,
  hideOverflow: false,
  timing: {
    duration: 1150,
    iterations: 1,

  },
  glitchTimeSpan: {
    start: 0,
    end: 1,
  },
  shake: {
    velocity: 15,
    amplitudeX: 0.1,
    amplitudeY: 0.1,
  },
  slice: {
    count: 6,
    velocity: 15,
    minHeight: 0.02,
    maxHeight: 0.15,
    hueRotate: true,
  },
  pulse: false,
};

const GlitchedLogo: React.FC = () => {
  const glitch = useGlitch(useGlitchOptions);
  return (
    <span ref={glitch.ref} className="inline-block relative top-[0.2rem]">
      <PlaceholderLogo />
    </span>
  );
};

const GlitchedTwitterButton: React.FC = () => {
  const glitch = useGlitch(useGlitchOptions);
  return (
    <span ref={glitch.ref} className="inline-block">
      <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
        <TwitterIcon className="h-5 w-5" />
      </Button>
    </span>
  );
};


const NavigationBar: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <nav className="NavBar fixed top-0 left-0 right-0 z-50 h-[52px] backdrop-blur-md shadow-lg">
      <div className="container mx-auto flex h-full items-center justify-between"> {/* Removed px classes */}
        {!isMobile ? (
          <>
            <Link href="/" aria-label="Homepage">
              <GlitchedLogo />
            </Link>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <GlitchedTwitterButton />
            </a>
          </>
        ) : (
          <>
            <Link href="/" aria-label="Homepage">
               <span className="inline-block relative top-[0.2rem]">
                 <PlaceholderLogo className="h-7 w-7"/>
               </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer">
                    Twitter / X
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
    

    
