import React from "react";
import { format } from "date-fns";
import { User, Check } from "lucide-react";
import StarRatingComponent from "./star-rating";
import { cn } from "@/lib/utils";

function ReviewItem({ review, className, isUsersReview = false }) {
  if (!review) return null;

  // Use consistent field names
  const rating = review.reviewValue ?? 0;
  const message = review.reviewMessage ?? "";

  // Format date safely
  let formattedDate = "";
  try {
    if (review.createdAt) {
      formattedDate = format(new Date(review.createdAt), "MMM d, yyyy");
    }
  } catch (error) {
    console.error("Error formatting date:", error);
  }

  return (
    <div className={cn(
      "border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0 transition-colors",
      isUsersReview && "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
      className
    )}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
            isUsersReview 
              ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
              : "bg-muted"
          )}>
            {isUsersReview ? (
              <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">
                {review.userName || review.user?.name || "Anonymous User"}
              </p>
              {isUsersReview && (
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRatingComponent 
                rating={rating} 
                size="xs" 
                showLabel={false}
              />
              {formattedDate && (
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className={cn(
        "text-sm text-foreground pl-[52px]",
        isUsersReview && "text-blue-800 dark:text-blue-200"
      )}>
        {message}
      </p>
      
      {/* Optional: Show helpful votes or other metadata */}
      {review.helpfulVotes > 0 && (
        <div className="pl-[52px] mt-2">
          <span className="text-xs text-muted-foreground">
            {review.helpfulVotes} {review.helpfulVotes === 1 ? 'person' : 'people'} found this helpful
          </span>
        </div>
      )}
      
      {/* Optional: Show if review is from verified purchase */}
      {review.isVerifiedPurchase && (
        <div className="pl-[52px] mt-1">
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
            ✓ Verified Purchase
          </span>
        </div>
      )}
    </div>
  );
}

export default ReviewItem;