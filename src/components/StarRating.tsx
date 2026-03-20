"use client";

import { useState } from "react";

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);

  const sizes = { sm: "text-sm", md: "text-xl", lg: "text-2xl" };

  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (readonly ? value : hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"
            } ${filled ? "text-yellow-400" : "text-gray-600"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
