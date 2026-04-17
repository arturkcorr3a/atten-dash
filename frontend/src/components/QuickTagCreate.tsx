import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "./Modal";
import { tagApi } from "../services/api";
import type { Tag, CreateTagPayload } from "../types";

const PASTEL_COLOR_MAP = {
  "Pastel Pink": "#FFD1DC",
  "Pastel Purple": "#E0BBE4",
  "Pastel Blue": "#B2E2F2",
  "Pastel Peach": "#FFDAC1",
  "Pastel Mint": "#C9F0DD",
  "Pastel Cream": "#F9E4C8",
  "Pastel Lavender": "#E5D4ED",
  "Pastel Sky Blue": "#B4E7FF",
};

const COLOR_NAMES = Object.keys(PASTEL_COLOR_MAP);
const PASTEL_COLORS = Object.values(PASTEL_COLOR_MAP);

const getRandomPastelColor = (): string => {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
};

const getColorName = (hexColor: string): string => {
  return (
    Object.entries(PASTEL_COLOR_MAP).find(
      ([, color]) => color === hexColor,
    )?.[0] || "Unknown Color"
  );
};

interface QuickTagCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onTagCreated: (tag: Tag, tagType: "subject" | "absence") => void;
  tagType: "subject" | "absence";
}

export function QuickTagCreate({
  isOpen,
  onClose,
  onTagCreated,
  tagType,
}: Readonly<QuickTagCreateProps>) {
  const [tagName, setTagName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(
    getRandomPastelColor(),
  );
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const trimmedName = tagName.trim();
    if (!trimmedName) {
      toast.error("Tag name is required");
      return;
    }

    try {
      setIsCreating(true);
      const payload: CreateTagPayload = {
        name: trimmedName,
        color: selectedColor,
      };
      const newTag = await tagApi.create(payload, tagType);
      toast.success("Tag created successfully");
      onTagCreated(newTag, tagType);
      setTagName("");
      setSelectedColor(getRandomPastelColor());
      onClose();
    } catch {
      toast.error("Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = (): void => {
    if (!isCreating) {
      setTagName("");
      setSelectedColor(getRandomPastelColor());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} title="Create Tag" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="quick-tag-name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Tag Name
          </label>
          <input
            id="quick-tag-name"
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="e.g., Medical, Travel"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            disabled={isCreating}
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="quick-tag-color"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Color
          </label>
          <div className="flex items-center gap-2">
            <div
              className="h-10 w-10 rounded-md border-2 border-slate-300"
              style={{ backgroundColor: selectedColor }}
            />
            <select
              id="quick-tag-color"
              value={getColorName(selectedColor)}
              onChange={(e) =>
                setSelectedColor(
                  PASTEL_COLOR_MAP[
                    e.target.value as keyof typeof PASTEL_COLOR_MAP
                  ],
                )
              }
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              disabled={isCreating}
            >
              {COLOR_NAMES.map((colorName) => (
                <option key={colorName} value={colorName}>
                  {colorName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSelectedColor(getRandomPastelColor())}
              disabled={isCreating}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              🎲
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isCreating}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isCreating ? "Creating..." : "Create Tag"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
