import Constants from "expo-constants";
import { Platform } from "react-native";

export const DEFAULT_API_BASE_URL = "https://casanirvana-backend.onrender.com";

const fromExpoConfig = Constants.expoConfig?.extra?.API_BASE_URL;
const allowPrivateApiBaseUrlFromExpoConfig =
  Constants.expoConfig?.extra?.ALLOW_PRIVATE_API_BASE_URL === true;
const fromPublicEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
const fromEnv = process.env.API_BASE_URL;
const allowPrivateApiBaseUrlFromEnv =
  process.env.EXPO_PUBLIC_ALLOW_PRIVATE_API_BASE_URL === "true" ||
  process.env.ALLOW_PRIVATE_API_BASE_URL === "true";

const allowPrivateApiBaseUrl =
  allowPrivateApiBaseUrlFromExpoConfig || allowPrivateApiBaseUrlFromEnv;

const isLoopbackHostname = (hostname) =>
  ["localhost", "127.0.0.1", "0.0.0.0"].includes(String(hostname || "").toLowerCase());

const isPrivateIpv4Hostname = (hostname) => {
  const normalized = String(hostname || "").trim();
  const octets = normalized.split(".").map((segment) => Number(segment));

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  if (octets[0] === 10) return true;
  if (octets[0] === 192 && octets[1] === 168) return true;
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
  if (octets[0] === 169 && octets[1] === 254) return true;

  return false;
};

const configuredApiBaseUrl =
  fromExpoConfig ||
  fromPublicEnv ||
  fromEnv ||
  DEFAULT_API_BASE_URL;

const normalizeApiBaseUrl = (value) => String(value || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
const isNativeRuntime = Platform.OS === "ios" || Platform.OS === "android";
const isProductionLikeNativeRuntime =
  isNativeRuntime && (!__DEV__ || Constants.executionEnvironment === "storeClient");

const shouldForceProductionApiBaseUrl = (value) => {
  if (!isProductionLikeNativeRuntime || allowPrivateApiBaseUrl) {
    return false;
  }

  try {
    const url = new URL(value);
    const isPrivateHost =
      isLoopbackHostname(url.hostname) || isPrivateIpv4Hostname(url.hostname);

    if (isPrivateHost) {
      return true;
    }

    return url.protocol !== "https:";
  } catch {
    return true;
  }
};

const normalizedConfiguredApiBaseUrl = normalizeApiBaseUrl(configuredApiBaseUrl);

export const API_BASE_URL =
  shouldForceProductionApiBaseUrl(normalizedConfiguredApiBaseUrl)
    ? DEFAULT_API_BASE_URL
    : normalizedConfiguredApiBaseUrl;

export const buildApiUrl = (path = "") =>
  path.startsWith("/")
    ? `${API_BASE_URL}${path}`
    : `${API_BASE_URL}/${path}`;
