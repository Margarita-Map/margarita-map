import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface GameState {
  currentPlayer: 1 | 2;
  scores: { player1: number; player2: number };
  isAiming: boolean;
  quarter: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    isMoving: boolean;
    hasBouncedOnTable: boolean;
    inHand: boolean;
  };
  aimStart: { x: number; y: number } | null;
  aimEnd: { x: number; y: number } | null;
}

const QuartersGameBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const TABLE_HEIGHT = 60;
  const TABLE_Y = CANVAS_HEIGHT - TABLE_HEIGHT;
  const GLASS_X = 650;
  const GLASS_Y = TABLE_Y - 80;
  const GLASS_WIDTH = 60;
  const GLASS_HEIGHT = 80;
  const QUARTER_RADIUS = 8;
  const GRAVITY = 0.2;  // Increased gravity for more realistic drop
  const BOUNCE_DAMPING = 0.6;  // Reduced for better bounces
  const WALL_BOUNCE_DAMPING = 0.8;
  const FRICTION = 0.99;  // Reduced friction so quarter moves longer
  const HAND_X = 120;
  const HAND_Y = 200;
  
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 1,
    scores: { player1: 0, player2: 0 },
    isAiming: false,
    quarter: {
      x: HAND_X,
      y: HAND_Y,
      vx: 0,
      vy: 0,
      rotation: 0,
      isMoving: false,
      hasBouncedOnTable: false,
      inHand: true
    },
    aimStart: null,
    aimEnd: null
  });


  const drawGame = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas with room background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#87CEEB');
    bgGradient.addColorStop(1, '#4682B4');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw table
    const tableGradient = ctx.createLinearGradient(0, TABLE_Y, 0, CANVAS_HEIGHT);
    tableGradient.addColorStop(0, '#8B4513');
    tableGradient.addColorStop(1, '#654321');
    ctx.fillStyle = tableGradient;
    ctx.fillRect(0, TABLE_Y, CANVAS_WIDTH, TABLE_HEIGHT);
    
    // Draw table surface with wood grain effect
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(0, TABLE_Y, CANVAS_WIDTH, 12);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, TABLE_Y);
      ctx.lineTo(i + 10, TABLE_Y + 12);
      ctx.stroke();
    }
    
    // Draw margarita glass
    const glassGradient = ctx.createLinearGradient(GLASS_X, GLASS_Y, GLASS_X, GLASS_Y + GLASS_HEIGHT);
    glassGradient.addColorStop(0, 'rgba(50, 255, 150, 0.3)');
    glassGradient.addColorStop(1, 'rgba(0, 200, 100, 0.5)');
    
    // Glass bowl (wider at top)
    ctx.beginPath();
    ctx.moveTo(GLASS_X + 10, GLASS_Y + GLASS_HEIGHT);
    ctx.lineTo(GLASS_X + GLASS_WIDTH - 10, GLASS_Y + GLASS_HEIGHT);
    ctx.lineTo(GLASS_X + GLASS_WIDTH, GLASS_Y);
    ctx.lineTo(GLASS_X, GLASS_Y);
    ctx.closePath();
    ctx.fillStyle = glassGradient;
    ctx.fill();
    ctx.strokeStyle = '#00AA00';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Glass stem
    ctx.fillStyle = 'rgba(200, 255, 200, 0.4)';
    ctx.fillRect(GLASS_X + 25, GLASS_Y + GLASS_HEIGHT, 10, 20);
    ctx.strokeRect(GLASS_X + 25, GLASS_Y + GLASS_HEIGHT, 10, 20);
    
    // Glass base
    ctx.fillRect(GLASS_X + 15, GLASS_Y + GLASS_HEIGHT + 20, 30, 5);
    ctx.strokeRect(GLASS_X + 15, GLASS_Y + GLASS_HEIGHT + 20, 30, 5);
    
    // Draw hand only when quarter is in hand
    if (gameState.quarter.inHand) {
      // Draw arm
      ctx.strokeStyle = '#D2B48C';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(20, HAND_Y + 60);
      ctx.lineTo(HAND_X - 20, HAND_Y + 20);
      ctx.stroke();
      
      // Draw hand (simplified)
      ctx.fillStyle = '#D2B48C';
      
      // Palm
      ctx.beginPath();
      ctx.ellipse(HAND_X, HAND_Y, 25, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Thumb
      ctx.beginPath();
      ctx.ellipse(HAND_X - 25, HAND_Y - 10, 8, 20, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Fingers
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(HAND_X - 15 + i * 10, HAND_Y - 25, 6, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    
    // Draw quarter
    ctx.save();
    ctx.translate(gameState.quarter.x, gameState.quarter.y);
    ctx.rotate(gameState.quarter.rotation);
    
    const quarterGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, QUARTER_RADIUS);
    quarterGradient.addColorStop(0, '#FFD700');
    quarterGradient.addColorStop(0.7, '#DAA520');
    quarterGradient.addColorStop(1, '#B8860B');
    
    ctx.beginPath();
    ctx.arc(0, 0, QUARTER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = quarterGradient;
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add quarter details for rotation effect
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-QUARTER_RADIUS * 0.6, 0);
    ctx.lineTo(QUARTER_RADIUS * 0.6, 0);
    ctx.moveTo(0, -QUARTER_RADIUS * 0.6);
    ctx.lineTo(0, QUARTER_RADIUS * 0.6);
    ctx.stroke();
    
    ctx.restore();
    
    // Draw aiming line from hand to mouse
    if (gameState.isAiming && gameState.aimStart && gameState.aimEnd && gameState.quarter.inHand) {
      ctx.strokeStyle = '#FF4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(HAND_X, HAND_Y);
      ctx.lineTo(gameState.aimEnd.x, gameState.aimEnd.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw power indicator
      const distance = Math.sqrt(
        Math.pow(gameState.aimEnd.x - HAND_X, 2) + 
        Math.pow(gameState.aimEnd.y - HAND_Y, 2)
      );
      const power = Math.min(distance / 100, 1);
      
      ctx.fillStyle = `rgba(255, ${255 - power * 200}, 0, 0.7)`;
      ctx.fillRect(10, 10, power * 100, 20);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 100, 20);
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText('Power', 115, 25);
    }
  }, [gameState]);

  const updatePhysics = useCallback(() => {
    setGameState(prev => {
      if (!prev.quarter.isMoving) return prev;
      
      const newQuarter = { ...prev.quarter };
      
      // Apply gravity
      newQuarter.vy += GRAVITY;
      
      // Add rotation based on horizontal velocity
      newQuarter.rotation += newQuarter.vx * 0.05;
      
      // Update position - this is the key fix!
      newQuarter.x += newQuarter.vx;
      newQuarter.y += newQuarter.vy;
      
      // Apply friction
      newQuarter.vx *= FRICTION;
      
      console.log('Quarter position:', newQuarter.x, newQuarter.y, 'velocity:', newQuarter.vx, newQuarter.vy);
      
      // Check wall bounces (left and right walls)
      if (newQuarter.x - QUARTER_RADIUS <= 0 || newQuarter.x + QUARTER_RADIUS >= CANVAS_WIDTH) {
        if (newQuarter.x - QUARTER_RADIUS <= 0) {
          newQuarter.x = QUARTER_RADIUS;
        } else {
          newQuarter.x = CANVAS_WIDTH - QUARTER_RADIUS;
        }
        newQuarter.vx *= -WALL_BOUNCE_DAMPING;
      }
      
      // Check ceiling bounce
      if (newQuarter.y - QUARTER_RADIUS <= 0) {
        newQuarter.y = QUARTER_RADIUS;
        newQuarter.vy *= -BOUNCE_DAMPING;
      }
      
      // Check table bounce
      if (newQuarter.y + QUARTER_RADIUS >= TABLE_Y && newQuarter.vy > 0) {
        console.log('Quarter bounced on table!');
        newQuarter.y = TABLE_Y - QUARTER_RADIUS;
        newQuarter.vy *= -BOUNCE_DAMPING;
        newQuarter.hasBouncedOnTable = true;
        
        // Add some randomness to the bounce
        newQuarter.vx += (Math.random() - 0.5) * 0.3;
        
        // Only stop if velocity is very low and on table
        if (Math.abs(newQuarter.vy) < 0.5 && Math.abs(newQuarter.vx) < 0.5) {
          newQuarter.vy = 0;
          newQuarter.vx *= 0.8;
        }
      }
      
      // Check glass collision
      if (newQuarter.hasBouncedOnTable && 
          newQuarter.x >= GLASS_X && newQuarter.x <= GLASS_X + GLASS_WIDTH &&
          newQuarter.y >= GLASS_Y && newQuarter.y <= GLASS_Y + GLASS_HEIGHT) {
        
        // Score!
        const newScores = { ...prev.scores };
        if (prev.currentPlayer === 1) {
          newScores.player1++;
          toast.success("Player 1 scores! Player 2 drinks! 🍹");
        } else {
          newScores.player2++;
          toast.success("Player 2 scores! Player 1 drinks! 🍹");
        }
        
        return {
          ...prev,
          scores: newScores,
          quarter: {
            x: HAND_X,
            y: HAND_Y,
            vx: 0,
            vy: 0,
            rotation: 0,
            isMoving: false,
            hasBouncedOnTable: false,
            inHand: true
          }
        };
      }
      
      // Check boundaries and stop if out of bounds or stopped
      if (newQuarter.x < -50 || newQuarter.x > CANVAS_WIDTH + 50 || 
          newQuarter.y > CANVAS_HEIGHT + 50 ||
          (Math.abs(newQuarter.vx) < 0.1 && Math.abs(newQuarter.vy) < 0.1 && 
           newQuarter.hasBouncedOnTable && newQuarter.y >= TABLE_Y - QUARTER_RADIUS - 5)) {
        
        console.log('Quarter stopped or went out of bounds');
        toast.info(`Player ${prev.currentPlayer} missed! Next player's turn.`);
        
        return {
          ...prev,
          currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
          quarter: {
            x: HAND_X,
            y: HAND_Y,
            vx: 0,
            vy: 0,
            rotation: 0,
            isMoving: false,
            hasBouncedOnTable: false,
            inHand: true
          }
        };
      }
      
      return {
        ...prev,
        quarter: newQuarter
      };
    });
  }, []); // Empty dependency array to avoid stale closures

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      drawGame(ctx);
      updatePhysics();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawGame, updatePhysics]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.quarter.isMoving || !gameState.quarter.inHand) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    setGameState(prev => ({
      ...prev,
      isAiming: true,
      aimStart: { x: HAND_X, y: HAND_Y },
      aimEnd: { x, y }
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.isAiming) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    setGameState(prev => ({
      ...prev,
      aimEnd: { x, y }
    }));
  };

  const handleMouseUp = () => {
    if (!gameState.isAiming || !gameState.aimStart || !gameState.aimEnd || !gameState.quarter.inHand) return;
    
    const dx = gameState.aimEnd.x - HAND_X;
    const dy = gameState.aimEnd.y - HAND_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(distance / 100, 1.5);
    
    // Normalize direction and apply power - much slower and more controllable
    const normalizedVx = (dx / distance) * power * 1.5;  // Reduced from 3 to 1.5
    const normalizedVy = (dy / distance) * power * 1.5;  // Reduced from 3 to 1.5
    
    console.log('Shooting quarter with velocity:', normalizedVx, normalizedVy);
    
    setGameState(prev => ({
      ...prev,
      isAiming: false,
      aimStart: null,
      aimEnd: null,
      quarter: {
        ...prev.quarter,
        x: HAND_X,
        y: HAND_Y,
        vx: normalizedVx,
        vy: normalizedVy,
        isMoving: true,
        hasBouncedOnTable: false,
        inHand: false
      }
    }));
  };

  const resetGame = () => {
    setGameState({
      currentPlayer: 1,
      scores: { player1: 0, player2: 0 },
      isAiming: false,
      quarter: {
        x: HAND_X,
        y: HAND_Y,
        vx: 0,
        vy: 0,
        rotation: 0,
        isMoving: false,
        hasBouncedOnTable: false,
        inHand: true
      },
      aimStart: null,
      aimEnd: null
    });
    toast.success("New game started!");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">Player 1</div>
            <div className="text-xl text-muted-foreground">{gameState.scores.player1} points</div>
            {gameState.currentPlayer === 1 && (
              <div className="text-sm text-primary font-semibold">Your Turn!</div>
            )}
          </div>
          
          <Button onClick={resetGame} variant="outline">
            New Game
          </Button>
          
          <div className="text-center">
            <div className="text-2xl font-bold">Player 2</div>
            <div className="text-xl text-muted-foreground">{gameState.scores.player2} points</div>
            {gameState.currentPlayer === 2 && (
              <div className="text-sm text-primary font-semibold">Your Turn!</div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border border-border rounded-lg cursor-crosshair bg-gradient-to-b from-sky-200 to-sky-100 dark:from-sky-900 dark:to-sky-800"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Player {gameState.currentPlayer}'s turn - Click and drag to aim, release to shoot!</p>
          <p>The quarter must bounce on the table before going in the glass!</p>
        </div>
      </Card>
    </div>
  );
};

export default QuartersGameBoard;