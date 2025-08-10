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
    audioRef.current.volume = 0.5;
    
    // Try to auto-play
    const playAudio = async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
      } catch (error) {
        // Auto-play failed (browser policy), user will need to click
        setIsPlaying(false);
      }
    };
    
    playAudio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
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
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </Button>

      {!isPlaying && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white/80 animate-pulse text-center">
          Click to play mariachi music! 🎵
        </div>
      )}
    </div>
  );
};

export default SimpleMariachiBand;