
import { TileType } from "./types";

interface GameTileProps {
  tile: TileType;
  isSelected: boolean;
  onClick: () => void;
}

const margaritaEmojis = ["🍹", "🥃", "🍸", "🍊", "🍋", "🥭"];
const margaritaColors = [
  "from-lime-400 to-lime-600",    // Classic lime
  "from-orange-400 to-orange-600", // Orange margarita
  "from-pink-400 to-pink-600",     // Strawberry
  "from-blue-400 to-blue-600",     // Blue curacao
  "from-yellow-400 to-yellow-600", // Pineapple
  "from-purple-400 to-purple-600"  // Berry
];

const GameTile = ({ tile, isSelected, onClick }: GameTileProps) => {
  if (tile.isEmpty) {
    return <div className="w-10 h-10 bg-transparent"></div>;
  }

  return (
    <div
      className={`
        w-10 h-10 rounded-lg cursor-pointer transition-all duration-200
        flex items-center justify-center text-lg
        bg-gradient-to-br ${margaritaColors[tile.type]}
        hover:scale-110 active:scale-95
        shadow-md hover:shadow-lg
        ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : ''}
        ${tile.isMatched ? 'animate-ping opacity-50' : ''}
      `}
      onClick={onClick}
    >
      <span className="drop-shadow-sm">
        {margaritaEmojis[tile.type]}
      </span>
    </div>
  );
};

export default GameTile;
