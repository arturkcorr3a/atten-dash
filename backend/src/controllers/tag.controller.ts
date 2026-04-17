import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest, CreateTagBody, Tag } from "../types";
import { createAuthenticatedSupabaseClient } from "../config/supabase";
import { getAuthContext } from "./subject.controller";

type AsyncRequestHandler<TParams = Record<string, string>, TBody = unknown> = (
  request: Request<TParams, unknown, TBody>,
  response: Response,
  next: NextFunction,
) => Promise<void>;

export const getTags: AsyncRequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const tagType = (authenticatedRequest.query?.type as string) ?? "subject";
    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("tags")
      .select("id, user_id, name, color, tag_type, created_at")
      .eq("user_id", authContext.userId)
      .eq("tag_type", tagType)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[TAGS] Failed to fetch tags", {
        userId: authContext.userId,
        code: error.code,
        message: error.message,
      });

      response.status(400).json({ message: "Failed to fetch tags" });
      return;
    }

    const tags = (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      color: row.color,
      tagType: (row.tag_type ?? "subject") as "subject" | "absence",
      createdAt: row.created_at,
    })) as Tag[];

    response.status(200).json(tags);
  } catch (error) {
    next(error);
  }
};

export const createTag: AsyncRequestHandler<unknown, CreateTagBody> = async (
  request,
  response,
  next,
) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<
      unknown,
      CreateTagBody
    >;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, color } = authenticatedRequest.body;
    const tagType = (authenticatedRequest.query?.type as string) ?? "subject";

    if (!name || typeof name !== "string") {
      response.status(400).json({ message: "Tag name is required" });
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      response.status(400).json({ message: "Tag name cannot be empty" });
      return;
    }

    const tagColor = color ?? "#6366F1";

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("tags")
      .insert({
        user_id: authContext.userId,
        name: trimmedName,
        color: tagColor,
        tag_type: tagType,
      })
      .select("id, user_id, name, color, tag_type, created_at")
      .single();

    if (error) {
      console.error("[TAG] Failed to create tag", {
        userId: authContext.userId,
        name: trimmedName,
        code: error.code,
        message: error.message,
      });

      response.status(400).json({ message: "Failed to create tag" });
      return;
    }

    const tag: Tag = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      color: data.color,
      tagType: (data.tag_type ?? "subject") as "subject" | "absence",
      createdAt: data.created_at,
    };

    response.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

export const deleteTag: AsyncRequestHandler<{ tagId: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<{
      tagId: string;
    }>;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { tagId } = authenticatedRequest.params;

    if (!tagId) {
      response.status(400).json({ message: "tagId is required" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { error: deleteError } = await supabase
      .from("tags")
      .delete()
      .eq("id", tagId)
      .eq("user_id", authContext.userId);

    if (deleteError) {
      console.error("[TAG] Failed to delete tag", {
        tagId,
        userId: authContext.userId,
        code: deleteError.code,
        message: deleteError.message,
      });

      response.status(400).json({ message: "Failed to delete tag" });
      return;
    }

    response.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateTag: AsyncRequestHandler<
  { tagId: string },
  Partial<CreateTagBody>
> = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<
      { tagId: string },
      Partial<CreateTagBody>
    >;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { tagId } = authenticatedRequest.params;

    if (!tagId) {
      response.status(400).json({ message: "tagId is required" });
      return;
    }

    const { name, color } = authenticatedRequest.body;

    const updatePayload: Record<string, unknown> = {};

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        response.status(400).json({ message: "Tag name cannot be empty" });
        return;
      }

      updatePayload.name = trimmedName;
    }

    if (color !== undefined) {
      updatePayload.color = color;
    }

    if (Object.keys(updatePayload).length === 0) {
      response
        .status(400)
        .json({ message: "At least one field must be updated" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("tags")
      .update(updatePayload)
      .eq("id", tagId)
      .eq("user_id", authContext.userId)
      .select("id, user_id, name, color, created_at")
      .single();

    if (error) {
      console.error("[TAG] Failed to update tag", {
        tagId,
        userId: authContext.userId,
        code: error.code,
        message: error.message,
      });

      response.status(400).json({ message: "Failed to update tag" });
      return;
    }

    const updatedTag: Tag = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      color: data.color,
      createdAt: data.created_at,
    };

    response.status(200).json(updatedTag);
  } catch (error) {
    next(error);
  }
};
