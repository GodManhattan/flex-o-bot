// components/CountdownTimer.tsx
import React from "react";
import { useCountdown } from "@/app/hooks/useCountdown";

interface CountdownTimerProps {
  targetDate: Date;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  size = "md",
  showLabels = true,
  className = "",
}) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const digitClasses = {
    sm: "text-lg font-bold",
    md: "text-xl font-bold",
    lg: "text-3xl font-bold",
  };

  if (isExpired) {
    return (
      <div
        className={`text-red-600 font-semibold ${sizeClasses[size]} ${className}`}
      >
        🕒 Poll Closed
      </div>
    );
  }

  const timeUnits = [
    { value: days, label: "Days", show: days > 0 },
    { value: hours, label: "Hours", show: days > 0 || hours > 0 },
    { value: minutes, label: "Minutes", show: true },
    { value: seconds, label: "Seconds", show: true },
  ].filter((unit) => unit.show);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-green-600">⏰</span>
      <div className="flex items-center space-x-1">
        {timeUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            <div className="text-center">
              <div className={`${digitClasses[size]} text-gray-900`}>
                {unit.value.toString().padStart(2, "0")}
              </div>
              {showLabels && (
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {unit.label}
                </div>
              )}
            </div>
            {index < timeUnits.length - 1 && (
              <div className={`${digitClasses[size]} text-gray-400 px-1`}>
                :
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <span className="text-gray-600 text-sm">remaining</span>
    </div>
  );
};
