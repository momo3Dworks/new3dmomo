
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import NavigationBar from '@/components/layout/NavigationBar';
import YouTubeAudioPlayer from '@/components/YouTubeAudioPlayer'; // Added import

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ScrollSurfer',
  description: 'Advance a spaceship through biomes by scrolling.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const backgroundAudioVideoId = "5CS17A0b72E";
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <NavigationBar />
        {children}
        <YouTubeAudioPlayer videoId={backgroundAudioVideoId} /> {/* Added YouTubeAudioPlayer */}
        <Toaster />
      </body>
    </html>
  );
}
