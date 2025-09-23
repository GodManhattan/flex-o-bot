// app/components/poll/SpotCounter.tsx
import React from "react";

interface SpotCounterProps {
  label: string;
  icon: React.FC<{ className?: string }>;
  value: number;
  onChange: (value: number) => void;
  color: "blue" | "orange" | "purple";
  disabled?: boolean;
}

export const SpotCounter: React.FC<SpotCounterProps> = ({
  label,
  icon: Icon,
  value,
  onChange,
  color,
  disabled = false,
}) => {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-900",
      label: "text-blue-800",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-900",
      label: "text-orange-800",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-900",
      label: "text-purple-800",
    },
  };

  const colorScheme = colors[color];
  const spotOptions = Array.from({ length: 21 }, (_, i) => i);

  return (
    <div
      className={`${colorScheme.bg} rounded-lg p-4 border ${colorScheme.border}`}
    >
      <label
        className={`block text-sm font-medium ${colorScheme.label} mb-3 flex items-center`}
      >
        <Icon className="w-4 h-4 inline mr-2" />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className={`w-full px-3 py-2 border ${colorScheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
      >
        {spotOptions.map((num) => (
          <option key={num} value={num}>
            {num} spot{num !== 1 ? "s" : ""}
          </option>
        ))}
      </select>
      <p className={`text-xs ${colorScheme.text} mt-2`}>
        {label.includes("Morning") && "AM shift availability"}
        {label.includes("Afternoon") && "PM shift availability"}
        {label.includes("Full Day") && "All-day availability"}
      </p>
    </div>
  );
};
