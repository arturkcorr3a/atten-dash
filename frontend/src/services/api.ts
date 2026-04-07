import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { supabase } from "./supabase";

export const api = axios.create({
  baseURL: "http://localhost:3000",
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
