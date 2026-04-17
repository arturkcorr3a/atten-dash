import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { tagApi } from "../services/api";
import type { Tag } from "../types";

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

interface TagManagementProps {
  onTagsUpdated?: () => void;
}

export function TagManagement({ onTagsUpdated }: Readonly<TagManagementProps>) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newTagName, setNewTagName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(
    getRandomPastelColor(),
  );
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isDeletingTagId, setIsDeletingTagId] = useState<string | null>(null);

  const fetchTags = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const fetchedTags = await tagApi.getAll();
      setTags(fetchedTags);
    } catch {
      toast.error("Failed to load tags");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const handleCreateTag = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const trimmedName = newTagName.trim();

    if (!trimmedName) {
      toast.error("Tag name is required");
      return;
    }

    try {
      setIsCreating(true);
      const newTag = await tagApi.create({
        name: trimmedName,
        color: selectedColor,
      });

      setTags((prevTags) => [...prevTags, newTag]);
      setNewTagName("");
      setSelectedColor(getRandomPastelColor());
      toast.success("Tag created successfully");
      onTagsUpdated?.();
    } catch {
      toast.error("Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (tagId: string): Promise<void> => {
    try {
      setIsDeletingTagId(tagId);
      await tagApi.delete(tagId);
      setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
      toast.success("Tag deleted successfully");
      onTagsUpdated?.();
    } catch {
      toast.error("Failed to delete tag");
    } finally {
      setIsDeletingTagId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center text-slate-500">Loading tags...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-4 font-semibold text-slate-900">Create New Tag</h3>

        <form onSubmit={handleCreateTag} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="tag-name" className="block text-sm text-slate-700">
              Tag Name
            </label>
            <input
              id="tag-name"
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g., Medical, Travel, Exam"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tag-color" className="block text-sm text-slate-700">
              Color
            </label>
            <div className="flex items-center gap-2">
              <div
                className="h-10 w-10 rounded-md border-2 border-slate-300"
                style={{ backgroundColor: selectedColor }}
              />
              <select
                id="tag-color"
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
                🎲 Random
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Tag"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-4 font-semibold text-slate-900">Your Tags</h3>

        {tags.length === 0 ? (
          <p className="text-center text-slate-500">No tags yet</p>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between rounded-md p-3"
                style={{
                  backgroundColor: tag.color,
                  color: getContrastTextColor(tag.color),
                }}
              >
                <div className="flex-1">
                  <p className="font-medium">{tag.name}</p>
                  <p className="text-xs opacity-75">{tag.color}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag.id)}
                  disabled={isDeletingTagId === tag.id}
                  className="rounded-md px-2 py-1 text-sm hover:opacity-75 disabled:opacity-50"
                  style={{
                    backgroundColor: getContrastTextColor(tag.color),
                    color: tag.color,
                  }}
                >
                  {isDeletingTagId === tag.id ? "..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
