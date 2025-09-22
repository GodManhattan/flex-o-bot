// components/TimerSelector.tsx
import React from "react";
import { formatDuration, addMinutesToNow } from "@/app/utils/timer";
import { CountdownTimer } from "./CountdownTimer";

interface TimerSelectorProps {
  value: string; // ISO string
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const PRESET_DURATIONS = [
  { minutes: 5, label: "5 minutes" },
  { minutes: 10, label: "10 minutes" },
  { minutes: 15, label: "15 minutes" },
  { minutes: 30, label: "30 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 120, label: "2 hours" },
  { minutes: 240, label: "4 hours" },
  { minutes: 480, label: "8 hours" },
  { minutes: 1440, label: "24 hours" },
];

export const TimerSelector: React.FC<TimerSelectorProps> = ({
  value,
  onChange,
  label = "Poll Duration",
  required = false,
  disabled = false,
  className = "",
}) => {
  const [useCustom, setUseCustom] = React.useState(false);
  const [customMinutes, setCustomMinutes] = React.useState(5);

  const handlePresetChange = (minutes: number) => {
    const targetDate = addMinutesToNow(minutes);
    onChange(targetDate.toISOString().slice(0, 16));
    setUseCustom(false);
  };

  const handleCustomChange = (minutes: number) => {
    if (minutes < 5) {
      minutes = 5; // Enforce minimum
    }
    setCustomMinutes(minutes);
    const targetDate = addMinutesToNow(minutes);
    onChange(targetDate.toISOString().slice(0, 16));
  };

  const handleDateTimeChange = (dateTimeValue: string) => {
    const selectedDate = new Date(dateTimeValue);
    const now = new Date();
    const diffMinutes = Math.ceil(
      (selectedDate.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 5) {
      // If less than 5 minutes, set to 5 minutes from now
      const minDate = addMinutesToNow(5);
      onChange(minDate.toISOString().slice(0, 16));
    } else {
      onChange(dateTimeValue);
    }
  };

  const currentDate = value ? new Date(value) : new Date();
  const isValidDate = currentDate > new Date();

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="space-y-4">
        {/* Preset Duration Buttons */}
        <div>
          <p className="text-sm text-gray-900 mb-2">Quick Select:</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_DURATIONS.map((preset) => (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => handlePresetChange(preset.minutes)}
                disabled={disabled}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Duration */}
        <div>
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">
              Custom duration (minutes)
            </span>
          </label>

          {useCustom && (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="5"
                max="10080" // 1 week
                value={customMinutes}
                onChange={(e) =>
                  handleCustomChange(parseInt(e.target.value) || 5)
                }
                disabled={disabled}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">
                minutes ({formatDuration(customMinutes)})
              </span>
            </div>
          )}
        </div>

        {/* Exact Date/Time Picker */}
        <div>
          <label className="block text-sm text-gray-900 mb-2">
            Or pick exact end time:
          </label>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => handleDateTimeChange(e.target.value)}
            min={addMinutesToNow(5).toISOString().slice(0, 16)}
            disabled={disabled}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Current Selection Display */}
        {isValidDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Poll will close:
                </p>
                <p className="text-sm text-blue-700">
                  {currentDate.toLocaleString()}
                </p>
              </div>
              <CountdownTimer
                targetDate={currentDate}
                size="sm"
                showLabels={false}
              />
            </div>
          </div>
        )}

        {/* Minimum Time Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Minimum duration:</strong> 5 minutes. This ensures
            participants have enough time to enter the poll.
          </p>
        </div>
      </div>
    </div>
  );
};
