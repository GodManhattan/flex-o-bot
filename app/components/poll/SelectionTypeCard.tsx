// app/components/poll/SelectionTypeCard.tsx
import React from "react";
import { Icons } from "@/app/components/icons/PollIcons";

interface SelectionTypeCardProps {
  type: "random" | "first_come_first_serve";
  selected: boolean;
  onClick: () => void;
}

export const SelectionTypeCard: React.FC<SelectionTypeCardProps> = ({
  type,
  selected,
  onClick,
}) => {
  const config = {
    random: {
      icon: Icons.Dice,
      title: "Random Selection",
      description:
        "Winners are randomly selected from all entries when the poll closes",
      benefits: ["Fair chance for everyone", "No rush to submit"],
      color: "purple",
    },
    first_come_first_serve: {
      icon: Icons.Lightning,
      title: "First Come, First Serve",
      description:
        "Spots are filled immediately as employees submit their entries",
      benefits: ["Instant confirmation", "Rewards quick action"],
      color: "orange",
    },
  };

  const details = config[type];
  const Icon = details.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-lg"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Icons.Check className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
        </div>
      )}

      {/* Icon and Title */}
      <div className="flex items-start mb-3 sm:mb-4 pr-8">
        <div
          className={`p-2 sm:p-3 rounded-lg ${
            selected ? "bg-blue-100" : "bg-gray-100"
          } mr-3 sm:mr-4 flex-shrink-0`}
        >
          <Icon
            className={`w-5 h-5 sm:w-7 sm:h-7 ${
              selected ? "text-blue-600" : "text-gray-600"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base sm:text-lg font-bold mb-1 ${
              selected ? "text-blue-900" : "text-gray-900"
            }`}
          >
            {details.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            {details.description}
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-1.5 sm:space-y-2">
        {details.benefits.map((benefit, index) => (
          <div key={index} className="flex items-start text-xs sm:text-sm">
            <Icons.Check
              className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0 ${
                selected ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <span
              className={
                selected ? "text-gray-700 font-medium" : "text-gray-600"
              }
            >
              {benefit}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
};
