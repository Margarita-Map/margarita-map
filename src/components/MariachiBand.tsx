import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const MariachiBand = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with mariachi music
    audioRef.current = new Audio();
    // Use your purchased TunePocket music file
    audioRef.current.src = "/audio/la-cucaracha.mp3"; // Update this filename to match your downloaded file
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    // Add error handling to debug audio issues
    audioRef.current.addEventListener('error', (e) => {
      console.log('Audio error:', e);
    });
    
    audioRef.current.addEventListener('canplaythrough', () => {
      console.log('Audio loaded successfully');
    });

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
      console.log("Audio playback failed - you may need to add your own mariachi music file:", error);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {/* Mariachi Band Animation */}
      <div className="flex items-end gap-2">
        {/* Mexican Mariachi Guitarist 1 */}
        <div className="relative">
          <div className="text-5xl animate-bounce" style={{ animationDelay: '0s' }}>
            🧔🏽‍♂️
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xl">
            🎸
          </div>
          <div className="absolute -top-3 -right-2 text-lg animate-pulse text-yellow-400">
            ♪
          </div>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs">
            🇲🇽
          </div>
        </div>

        {/* Mexican Mariachi Trumpeter */}
        <div className="relative">
          <div className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>
            👨🏽‍🦱
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xl">
            🎺
          </div>
          <div className="absolute -top-3 -left-2 text-lg animate-pulse text-yellow-400" style={{ animationDelay: '0.5s' }}>
            ♫
          </div>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs">
            🇲🇽
          </div>
        </div>

        {/* Mexican Mariachi Violinist */}
        <div className="relative">
          <div className="text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>
            👨🏽‍🦲
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xl">
            🎻
          </div>
          <div className="absolute -top-3 -right-2 text-lg animate-pulse text-yellow-400" style={{ animationDelay: '1s' }}>
            ♪
          </div>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs">
            🇲🇽
          </div>
        </div>

        {/* Mexican Mariachi Singer with Maracas */}
        <div className="relative">
          <div className="text-5xl animate-bounce" style={{ animationDelay: '0.6s' }}>
            🧔🏽
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xl">
            🪇
          </div>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-lg animate-pulse text-yellow-400" style={{ animationDelay: '1.5s' }}>
            ♫
          </div>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs">
            🇲🇽
          </div>
        </div>

        {/* Mexican Mariachi Accordionist */}
        <div className="relative">
          <div className="text-5xl animate-bounce" style={{ animationDelay: '0.8s' }}>
            👨🏽‍🦳
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xl">
            🪗
          </div>
          <div className="absolute -top-3 -left-2 text-lg animate-pulse text-yellow-400" style={{ animationDelay: '2s' }}>
            ♪
          </div>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs">
            🇲🇽
          </div>
        </div>
      </div>

      {/* Music Control Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMusic}
        className="bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:scale-110 transition-transform text-white hover:bg-white/30"
        title={isPlaying ? "Pause Mariachi Music" : "Play Mariachi Music"}
      >
        {isPlaying ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>

      {!hasUserInteracted && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white/80 animate-pulse text-center">
          Click to play mariachi music! 🎵
        </div>
      )}
    </div>
  );
};

export default MariachiBand;