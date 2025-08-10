import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const MariachiBand = () => {
  const [isPlaying, setIsPlaying] = useState(true); // Start as playing
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [audioStatus, setAudioStatus] = useState('loading');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const initAudio = () => {
      // Create audio element
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.preload = 'auto';
      
      // Primary source - local file first
      const primarySrc = "/audio/mariachi.mp3";
      // Backup source - external URL
      const backupSrc = "https://archive.org/download/78_viva-mexico-viva-america_pedro-galindo-el-mariachi-tapatio-marmolejo_gbia0064106b/Viva%20Mexico%20-%20Viva%20America%20-%20Pedro%20Galindo.mp3";
      
      audioRef.current.src = primarySrc;
      
      // Handle successful loading and auto-play
      audioRef.current.addEventListener('canplaythrough', async () => {
        console.log('Audio loaded successfully');
        console.log('Audio duration:', audioRef.current?.duration);
        console.log('Audio volume:', audioRef.current?.volume);
        console.log('Audio muted:', audioRef.current?.muted);
        setAudioStatus('ready');
        
        // Auto-play immediately when audio is ready
        if (audioRef.current) {
          try {
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 0.5; // Increase volume
            await audioRef.current.play();
            setIsPlaying(true);
            console.log('Auto-play started successfully');
            console.log('Audio is playing:', !audioRef.current.paused);
            console.log('Audio current time:', audioRef.current.currentTime);
          } catch (error) {
            console.log('Auto-play failed:', error);
            setIsPlaying(false);
          }
        }
      });
      
      audioRef.current.addEventListener('loadstart', () => {
        console.log('Audio loading started');
        setAudioStatus('loading');
      });
      
      // Handle errors and try backup
      audioRef.current.addEventListener('error', (e) => {
        console.log('Primary audio failed, trying backup source:', e);
        setAudioStatus('trying-backup');
        if (audioRef.current && audioRef.current.src !== backupSrc) {
          audioRef.current.src = backupSrc;
          audioRef.current.load();
        } else {
          console.log('Both audio sources failed');
          setAudioStatus('failed');
        }
      });
      
      // Try to load the audio
      audioRef.current.load();
    };

    initAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('canplaythrough', () => {});
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current.removeEventListener('loadstart', () => {});
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current || audioStatus === 'failed') {
      console.log('Audio not available');
      return;
    }

    setHasUserInteracted(true);

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        console.log('Audio paused');
      } else {
        console.log('Attempting to play audio...');
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('Audio playing');
      }
    } catch (error) {
      console.log("Audio playback failed:", error);
      setAudioStatus('failed');
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

      {!hasUserInteracted && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white/80 animate-pulse text-center">
          Click to play mariachi music! 🎵
        </div>
      )}
    </div>
  );
};

export default MariachiBand;