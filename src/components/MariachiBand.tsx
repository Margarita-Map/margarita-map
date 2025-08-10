import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const MariachiBand = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with mariachi music (using a placeholder URL)
    audioRef.current = new Audio();
    audioRef.current.src = "https://www.soundjay.com/misc/sounds/mariachi.mp3"; // Placeholder - you'll need to add actual mariachi music file
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    setHasUserInteracted(true);

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log("Audio playback failed:", error);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
      {/* Mariachi Band Animation */}
      <div className="flex items-end gap-1">
        {/* Guitarist 1 */}
        <div className="relative">
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>
            🎸
          </div>
          <div className="absolute -top-2 -right-1 text-lg animate-pulse">
            ♪
          </div>
        </div>

        {/* Trumpeter */}
        <div className="relative">
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>
            🎺
          </div>
          <div className="absolute -top-2 -left-1 text-lg animate-pulse" style={{ animationDelay: '0.5s' }}>
            ♫
          </div>
        </div>

        {/* Violinist */}
        <div className="relative">
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>
            🎻
          </div>
          <div className="absolute -top-2 -right-1 text-lg animate-pulse" style={{ animationDelay: '1s' }}>
            ♪
          </div>
        </div>

        {/* Guitarist 2 */}
        <div className="relative">
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>
            🎸
          </div>
          <div className="absolute -top-2 -left-1 text-lg animate-pulse" style={{ animationDelay: '1.5s' }}>
            ♫
          </div>
        </div>

        {/* Singer/Maracas */}
        <div className="relative">
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0.8s' }}>
            🪇
          </div>
          <div className="absolute -top-2 text-lg animate-pulse" style={{ animationDelay: '2s' }}>
            ♪
          </div>
        </div>
      </div>

      {/* Music Control Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMusic}
        className="bg-background/80 backdrop-blur-sm border-2 hover:scale-110 transition-transform"
        title={isPlaying ? "Pause Mariachi Music" : "Play Mariachi Music"}
      >
        {isPlaying ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>

      {!hasUserInteracted && (
        <div className="absolute -bottom-8 right-0 text-xs text-muted-foreground animate-pulse">
          Click to play music! 🎵
        </div>
      )}
    </div>
  );
};

export default MariachiBand;