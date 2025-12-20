import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { fr } from "@/lib/i18n";

export interface ScoreSelectorProps {
  value?: number;
  onChange: (value: number) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
}

const scores = [
  { value: 1, label: fr.scores[1], color: "bg-pink-500 hover:bg-pink-600" },
  { value: 2, label: fr.scores[2], color: "bg-green-500 hover:bg-green-600" },
  { value: 3, label: fr.scores[3], color: "bg-yellow-500 hover:bg-yellow-600" },
  { value: 4, label: fr.scores[4], color: "bg-gray-700 hover:bg-gray-800" },
];

/**
 * ScoreSelector Component
 *
 * A specialized score selector for Fox Club forms (1-4 scale)
 * Displays colored buttons with French labels
 * Fully keyboard accessible (Tab to navigate, Enter/Space to select)
 *
 * @example
 * <ScoreSelector
 *   label="Massages"
 *   value={2}
 *   onChange={(value) => console.log(value)}
 * />
 */
export const ScoreSelector: React.FC<ScoreSelectorProps> = ({
  value,
  onChange,
  error,
  label,
  disabled,
}) => {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    scoreValue: number
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(scoreValue);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {scores.map((score) => (
          <button
            key={score.value}
            type="button"
            onClick={() => onChange(score.value)}
            onKeyDown={(e) => handleKeyDown(e, score.value)}
            disabled={disabled}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
              score.color,
              value === score.value &&
                "ring-2 ring-offset-2 ring-primary-500",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-pressed={value === score.value}
          >
            {score.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
