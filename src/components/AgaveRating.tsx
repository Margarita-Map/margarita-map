import agaveIcon from "@/assets/agave-rating.png";

interface AgaveRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

const AgaveRating = ({ rating, size = "md", showCount = false }: AgaveRatingProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const stars = Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < rating;
    return (
      <img
        key={index}
        src={agaveIcon}
        alt="agave"
        className={`${sizeClasses[size]} transition-all duration-200 ${
          isFilled 
            ? "opacity-100 filter-none" 
            : "opacity-30 grayscale"
        }`}
      />
    );
  });

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars}
      </div>
      {showCount && (
        <span className="text-sm text-muted-foreground ml-2">
          ({rating}/5 agaves)
        </span>
      )}
    </div>
  );
};

export default AgaveRating;