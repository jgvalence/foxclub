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
  { value: 1, label: fr.scores[1], emoji: "❤️" },
  { value: 2, label: fr.scores[2], emoji: "🟢" },
  { value: 3, label: fr.scores[3], emoji: "🟠" },
  { value: 4, label: fr.scores[4], emoji: "⚫" },
];

/**
 * ScoreSelector Component
 *
 * A specialized score selector for Fox Club forms (1-4 scale)
 * Displays a dropdown select with colored indicators
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
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={cn(
          "w-full min-w-[140px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm",
          "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          disabled && "cursor-not-allowed bg-gray-100 opacity-50"
        )}
      >
        {scores.map((score) => (
          <option key={score.value} value={score.value}>
            {score.emoji} {score.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
