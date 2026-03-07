import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY_PREFIX = "casa_nirvana_guard_recent_resident_searches";
const MAX_RECENT_SEARCHES = 6;

const buildStorageKey = (authUserId, communityId) =>
  `${CACHE_KEY_PREFIX}:${authUserId || "anonymous"}:${communityId || "no-community"}`;

export async function loadRecentResidentSearches(authUserId, communityId) {
  if (!authUserId || !communityId) {
    return [];
  }

  try {
    const raw = await AsyncStorage.getItem(buildStorageKey(authUserId, communityId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("[ResidentSearchHistory] Failed to read recent searches:", error);
    return [];
  }
}

export async function saveRecentResidentSearch(authUserId, communityId, resident) {
  if (!authUserId || !communityId || !resident?.id) {
    return [];
  }

  try {
    const existing = await loadRecentResidentSearches(authUserId, communityId);
    const nextEntry = {
      id: resident.id,
      memberId: resident.memberId || resident.id,
      name: resident.name,
      unit: resident.unit || "",
      image: resident.image || null,
      phone: resident.phone || null,
      email: resident.email || null,
      updatedAt: new Date().toISOString(),
    };

    const deduped = existing.filter((item) => item.id !== nextEntry.id);
    const next = [nextEntry, ...deduped].slice(0, MAX_RECENT_SEARCHES);

    await AsyncStorage.setItem(buildStorageKey(authUserId, communityId), JSON.stringify(next));
    return next;
  } catch (error) {
    console.error("[ResidentSearchHistory] Failed to save recent search:", error);
    return [];
  }
}

export async function clearRecentResidentSearches(authUserId, communityId) {
  if (!authUserId || !communityId) {
    return;
  }

  try {
    await AsyncStorage.removeItem(buildStorageKey(authUserId, communityId));
  } catch (error) {
    console.error("[ResidentSearchHistory] Failed to clear recent searches:", error);
  }
}

export async function replaceRecentResidentSearches(authUserId, communityId, entries = []) {
  if (!authUserId || !communityId) {
    return [];
  }

  try {
    const normalizedEntries = Array.isArray(entries) ? entries.slice(0, MAX_RECENT_SEARCHES) : [];
    await AsyncStorage.setItem(
      buildStorageKey(authUserId, communityId),
      JSON.stringify(normalizedEntries),
    );
    return normalizedEntries;
  } catch (error) {
    console.error("[ResidentSearchHistory] Failed to replace recent searches:", error);
    return [];
  }
}
