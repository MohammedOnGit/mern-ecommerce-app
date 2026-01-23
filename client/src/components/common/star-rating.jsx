import React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button"; // Fixed import
import { cn } from "@/lib/utils";

function StarRatingComponent({ 
  rating = 0, 
  editable = false, 
  handleRatingChange, 
  size = "sm",
  showLabel = false,
  className = "",
  disabled = false
}) {
  // Define size mappings
  const sizeConfig = {
    xs: { star: "h-3 w-3", container: "h-6", text: "text-xs" },
    sm: { star: "h-4 w-4", container: "h-8", text: "text-sm" },
    md: { star: "h-5 w-5", container: "h-10", text: "text-base" },
    lg: { star: "h-6 w-6", container: "h-12", text: "text-lg" }
  };
  
  const config = sizeConfig[size] || sizeConfig.sm;
  
  // Safe rating value (protect against undefined/null)
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  const handleClick = (starValue) => {
    if (editable && handleRatingChange && !disabled) {
      handleRatingChange(starValue);
    }
  };

  const handleKeyDown = (e, starValue) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(starValue);
    }
  };

  const renderStar = (star, isActive) => {
    const isHalfStar = star - 0.5 === safeRating;
    const starId = `star-${star}`;
    
    if (editable) {
      return (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={cn(
            "p-0 bg-transparent border-0 cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm",
            config.container,
            isActive ? "text-yellow-500" : "text-gray-300 dark:text-gray-600",
            !disabled && "hover:scale-110 transition-transform",
            disabled && "cursor-not-allowed opacity-60"
          )}
          onClick={() => handleClick(star)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          aria-label={`Rate ${star} ${star === 1 ? 'star' : 'stars'}`}
          aria-pressed={isActive}
          title={disabled ? "Please login to rate" : `Rate ${star} stars`}
          tabIndex={disabled ? -1 : 0}
          id={starId}
        >
          <Star
            className={cn(config.star, "transition-colors")}
            fill={isActive ? "currentColor" : "none"}
            strokeWidth={isActive ? 1.5 : 1}
          />
        </button>
      );
    }
    
    // Non-editable star (display only)
    return (
      <div 
        key={star} 
        className="flex items-center"
        aria-hidden="true"
      >
        <Star
          className={cn(
            config.star,
            isActive 
              ? "text-yellow-500 fill-yellow-500" 
              : "text-gray-300 dark:text-gray-600",
            isHalfStar && "text-yellow-500 fill-yellow-500 fill-opacity-50"
          )}
        />
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-1", 
        className
      )}
      role={editable ? "radiogroup" : "img"}
      aria-label={editable ? "Product rating selector" : `Rated ${safeRating} out of 5 stars`}
    >
      <div className="flex" role={editable ? "none" : "presentation"}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= safeRating;
          return renderStar(star, isActive);
        })}
      </div>
      
      {showLabel && (
        <span className={cn(
          "text-muted-foreground ml-2",
          config.text
        )}>
          {safeRating > 0 ? (
            <>
              <span className="font-medium">{safeRating.toFixed(1)}</span>
              <span className="opacity-70">/5</span>
            </>
          ) : (
            <span className="opacity-70">No rating</span>
          )}
        </span>
      )}
      
      {/* Hidden accessible text for screen readers */}
      <span className="sr-only">
        {safeRating > 0 
          ? `Rated ${safeRating.toFixed(1)} out of 5 stars`
          : "Not rated"}
      </span>
    </div>
  );
}

export default StarRatingComponent;