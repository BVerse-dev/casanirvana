import Constants from "expo-constants";

export const DEFAULT_API_BASE_URL = "https://casanirvana-backend.onrender.com";

const fromExpoConfig = Constants.expoConfig?.extra?.API_BASE_URL;
const fromPublicEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
const fromEnv = process.env.API_BASE_URL;

const isLocalhostUrl = (value) => {
  if (!value) return false;

  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname);
  } catch {
    return false;
  }
};

const configuredApiBaseUrl =
  fromExpoConfig ||
  fromPublicEnv ||
  fromEnv ||
  DEFAULT_API_BASE_URL;

const normalizeApiBaseUrl = (value) => String(value || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

export const API_BASE_URL =
  Constants.executionEnvironment === "storeClient" && isLocalhostUrl(configuredApiBaseUrl)
    ? DEFAULT_API_BASE_URL
    : normalizeApiBaseUrl(configuredApiBaseUrl);

export const buildApiUrl = (path = "") =>
  path.startsWith("/")
    ? `${API_BASE_URL}${path}`
    : `${API_BASE_URL}/${path}`;
