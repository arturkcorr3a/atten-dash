import type { Tag } from "../types";

const getLuminance = (hexColor: string): number => {
  const rgb = Number.parseInt(hexColor.substring(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const getContrastTextColor = (hexColor: string): string => {
  return getLuminance(hexColor) > 0.5 ? "#333333" : "#FFFFFF";
};

interface TagChipProps {
  tag: Tag;
  size?: "sm" | "md" | "lg";
}

export function TagChip({ tag, size = "md" }: Readonly<TagChipProps>) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-block rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: tag.color,
        color: getContrastTextColor(tag.color),
      }}
    >
      {tag.name}
    </span>
  );
}
