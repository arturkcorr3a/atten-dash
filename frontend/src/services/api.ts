import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { supabase } from "./supabase";
import type { Tag, CreateTagPayload } from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;

    if (!accessToken) {
      return config;
    }

    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    config.headers = headers;

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Tag API endpoints
export const tagApi = {
  getAll: async (type: "subject" | "absence" = "subject"): Promise<Tag[]> => {
    const response = await api.get<Tag[]>("/api/tags", { params: { type } });
    return response.data;
  },

  create: async (
    payload: CreateTagPayload,
    type: "subject" | "absence" = "subject",
  ): Promise<Tag> => {
    const response = await api.post<Tag>("/api/tags", payload, {
      params: { type },
    });
    return response.data;
  },

  delete: async (tagId: string): Promise<void> => {
    await api.delete(`/api/tags/${tagId}`);
  },
};
