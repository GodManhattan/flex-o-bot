// app/components/poll/PollPreviewCard.tsx
import React from "react";
import { Icons } from "@/app/components/icons/PollIcons";

interface PollPreviewCardProps {
  title: string;
  selectionType: "random" | "first_come_first_serve";
  totalSpots: number;
  durationMinutes: number;
}

export const PollPreviewCard: React.FC<PollPreviewCardProps> = ({
  title,
  selectionType,
  totalSpots,
  durationMinutes,
}) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? "s" : ""}`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  };

  const calculateEndTime = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60000);
    return endTime.toLocaleString();
  };

  if (!title && totalSpots === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
      <h3 className="font-semibold text-blue-900 mb-3 flex items-center text-sm sm:text-base">
        <Icons.Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Poll Preview
      </h3>
      <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
        <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
          {title || "Untitled Poll"}
        </h4>
        <div className="space-y-2 text-xs sm:text-sm text-gray-700">
          <div className="flex items-center">
            {selectionType === "random" ? (
              <>
                <Icons.Dice className="w-4 h-4 mr-2 text-purple-600" />
                <span>Random Selection</span>
              </>
            ) : (
              <>
                <Icons.Lightning className="w-4 h-4 mr-2 text-orange-600" />
                <span>First Come, First Serve</span>
              </>
            )}
          </div>
          <div className="flex items-center">
            <Icons.Users className="w-4 h-4 mr-2 text-blue-600" />
            <span>{totalSpots} total spots</span>
          </div>
          <div className="flex items-center">
            <Icons.Clock className="w-4 h-4 mr-2 text-green-600" />
            <span>Duration: {formatDuration(durationMinutes)}</span>
          </div>
          <div className="flex items-center">
            <Icons.Calendar className="w-4 h-4 mr-2 text-purple-600" />
            <span>Closes: {calculateEndTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
