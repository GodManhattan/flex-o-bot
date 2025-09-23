// app/components/poll/DurationSelector.tsx
import React from "react";

interface DurationSelectorProps {
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
  disabled?: boolean;
  selectionType: "random" | "first_come_first_serve";
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  durationMinutes,
  onDurationChange,
  disabled = false,
  selectionType,
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

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 text-base mb-2">
          {selectionType === "first_come_first_serve"
            ? "Maximum Duration"
            : "Poll Duration"}
        </h4>
        <p className="text-sm text-gray-600">
          {selectionType === "first_come_first_serve"
            ? "Poll will close early if all spots are taken, or at this time limit."
            : "How long employees have to enter the poll before winners are selected."}
        </p>
      </div>

      {/* Duration Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center border border-blue-200">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {formatDuration(durationMinutes)}
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>Poll will close at:</strong>
          </p>
          <p className="text-gray-900 font-medium">{calculateEndTime()}</p>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="3"
          max="240"
          step="1"
          value={durationMinutes}
          onChange={(e) => onDurationChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer slider border border-blue-300"
        />
      </div>

      {/* Quick Duration Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[15, 30, 60, 120, 180, 240].map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => onDurationChange(minutes)}
            disabled={disabled}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              durationMinutes === minutes
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {formatDuration(minutes)}
          </button>
        ))}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            #2563eb 0%,
            #2563eb ${((durationMinutes - 3) / (240 - 3)) * 100}%,
            #e5e7eb ${((durationMinutes - 3) / (240 - 3)) * 100}%,
            #e5e7eb 100%
          );
        }

        .slider:focus {
          outline: none;
          ring: 2px;
          ring-color: #2563eb;
        }

        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
