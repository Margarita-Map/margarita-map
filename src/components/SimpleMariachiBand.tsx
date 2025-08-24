import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
const SimpleMariachiBand = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    // Create and setup audio on component mount
    audioRef.current = new Audio("https://archive.org/download/78_viva-mexico-viva-america_pedro-galindo-el-mariachi-tapatio-marmolejo_gbia0064106b/Viva%20Mexico%20-%20Viva%20America%20-%20Pedro%20Galindo.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    audioRef.current.preload = "auto";

    // Aggressive auto-play attempt
    const playAudio = async () => {
      try {
        // Try multiple times to start playing
        await audioRef.current?.play();
        setIsPlaying(true);
      } catch (error) {
        // If auto-play fails, try again after a short delay
        setTimeout(async () => {
          try {
            await audioRef.current?.play();
            setIsPlaying(true);
          } catch (e) {
            // Still failed, user will need to interact
            setIsPlaying(false);
          }
        }, 100);
      }
    };

    // Try to play immediately
    playAudio();

    // Also try on first user interaction (but not if they're clicking the toggle button)
    const handleFirstInteraction = async (event: Event) => {
      // Don't auto-play if user is clicking the music control button
      const target = event.target as HTMLElement;
      if (target?.closest('[title*="Music"]')) {
        return;
      }
      if (!isPlaying && audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (e) {
          // Still can't play
        }
      }
    };

    // Add listeners for first user interaction
    document.addEventListener('click', handleFirstInteraction, {
      once: true
    });
    document.addEventListener('touchstart', handleFirstInteraction, {
      once: true
    });
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);
  const toggleMusic = async () => {
    console.log('Toggle music clicked. Current isPlaying:', isPlaying);
    console.log('audioRef.current exists:', !!audioRef.current);
    if (!audioRef.current) {
      console.log('No audio reference found');
      return;
    }
    try {
      if (isPlaying) {
        console.log('Attempting to pause audio');
        audioRef.current.pause();
        console.log('Audio paused successfully. Audio paused state:', audioRef.current.paused);
        setIsPlaying(false);
      } else {
        console.log('Attempting to play audio');
        await audioRef.current.play();
        console.log('Audio play attempted');
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio toggle error:', error);
      setIsPlaying(false);
    }
  };
  return <div className="flex items-center justify-center gap-4 mb-8">
      {/* Mariachi Band Animation */}
      

      {/* Music Control Button */}
      
    </div>;
};
export default SimpleMariachiBand;