import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../utils/supabase";

const CACHE_KEY_PREFIX = "casa_nirvana_guard_module_settings";
const CACHE_INDEX_KEY = `${CACHE_KEY_PREFIX}:keys`;
const LEGACY_CACHE_KEY = "casa_nirvana_module_settings";
const CACHE_EXPIRY_MS = 30 * 1000;

export const MODULE_SLUGS = {
  VISITOR_ENTRY: "visitor_entry",
  DELIVERY_ENTRY: "delivery_entry",
  CAB_ENTRY: "cab_entry",
  SERVICE_ENTRY: "service_entry",
  EMERGENCY_ALERTS: "emergency_alerts",
  RESIDENT_DIRECTORY: "resident_directory",
};

export const SCREEN_TO_MODULE_MAP = {
  guestEntryScreen: MODULE_SLUGS.VISITOR_ENTRY,
  deliveryEntryScreen: MODULE_SLUGS.DELIVERY_ENTRY,
  cabEntryScreen: MODULE_SLUGS.CAB_ENTRY,
  serviceEntryScreen: MODULE_SLUGS.SERVICE_ENTRY,
  emergencyScreen: MODULE_SLUGS.EMERGENCY_ALERTS,
  emergencyDetailScreen: MODULE_SLUGS.EMERGENCY_ALERTS,
  searchScreen: MODULE_SLUGS.RESIDENT_DIRECTORY,
};

const KNOWN_MODULE_SLUGS = new Set(Object.values(MODULE_SLUGS));
const memoryCacheByScope = new Map();
let activeScopeKey = null;
let lastResolvedContext = null;
const reportedDriftWarnings = new Set();

const buildScopeKey = ({ authUserId, communityId }) =>
  [authUserId || "anonymous", "GUARD", communityId || "global"].join(":");

const buildStorageKey = (scopeKey) => `${CACHE_KEY_PREFIX}:${scopeKey}`;
const toCacheEntry = (modules, timestamp = Date.now()) => ({ modules, timestamp });
const isExpired = (timestamp) => Date.now() - timestamp > CACHE_EXPIRY_MS;

async function getCacheIndex() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("[GuardModuleSettings] Cache index read error:", error);
    return [];
  }
}

async function addKeyToCacheIndex(storageKey) {
  try {
    const keys = await getCacheIndex();
    if (!keys.includes(storageKey)) {
      keys.push(storageKey);
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(keys));
    }
  } catch (error) {
    console.error("[GuardModuleSettings] Cache index write error:", error);
  }
}

async function readScopedCache(scopeKey, allowExpired = false) {
  const storageKey = buildStorageKey(scopeKey);

  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.modules || !parsed?.timestamp) return null;
    if (!allowExpired && isExpired(parsed.timestamp)) return null;

    return toCacheEntry(parsed.modules, parsed.timestamp);
  } catch (error) {
    console.error("[GuardModuleSettings] Scoped cache read error:", error);
    return null;
  }
}

async function writeScopedCache(scopeKey, modules) {
  const storageKey = buildStorageKey(scopeKey);
  const payload = toCacheEntry(modules);

  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
    await addKeyToCacheIndex(storageKey);
  } catch (error) {
    console.error("[GuardModuleSettings] Scoped cache write error:", error);
  }
}

async function resolveModuleContext(communityIdOverride = null) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[GuardModuleSettings] Failed to resolve auth user:", userError);
  }

  if (!user) {
    lastResolvedContext = null;
    return {
      authUserId: null,
      communityId: communityIdOverride || null,
      userType: "GUARD",
    };
  }

  const [userResult, guardResult] = await Promise.all([
    supabase.from("users").select("id, role, community_id").eq("id", user.id).maybeSingle(),
    supabase.from("guards").select("community_id").eq("user_id", user.id).maybeSingle(),
  ]);

  if (userResult.error) {
    console.error("[GuardModuleSettings] Failed to resolve user scope:", userResult.error);
  }
  if (guardResult.error) {
    console.error("[GuardModuleSettings] Failed to resolve guard scope:", guardResult.error);
  }

  const fallbackContext =
    lastResolvedContext && lastResolvedContext.authUserId === user.id ? lastResolvedContext : null;

  const resolvedContext = {
    authUserId: user.id,
    communityId:
      communityIdOverride ||
      guardResult.data?.community_id ||
      userResult.data?.community_id ||
      fallbackContext?.communityId ||
      null,
    userType: "GUARD",
  };

  lastResolvedContext = resolvedContext;
  return resolvedContext;
}

function warnOnModuleMapDrift(modulesMap) {
  const loadedSlugs = new Set(Object.keys(modulesMap || {}));
  const missingInDb = [...KNOWN_MODULE_SLUGS].filter((slug) => !loadedSlugs.has(slug));
  const unmappedInCode = [...loadedSlugs].filter((slug) => !KNOWN_MODULE_SLUGS.has(slug));
  const signature = `GUARD|${missingInDb.join(",")}|${unmappedInCode.join(",")}`;

  if (reportedDriftWarnings.has(signature)) return;
  reportedDriftWarnings.add(signature);

  if (missingInDb.length > 0) {
    console.warn(
      `[GuardModuleSettings] Missing expected module slugs for GUARD: ${missingInDb.join(", ")}`
    );
  }

  if (unmappedInCode.length > 0) {
    console.warn(
      `[GuardModuleSettings] Unmapped module slugs from DB for GUARD: ${unmappedInCode.join(", ")}`
    );
  }
}

async function fetchModulesFromDB(context) {
  try {
    const { communityId } = context;

    const { data: modules, error: modulesError } = await supabase
      .from("module_settings")
      .select("*")
      .eq("user_type", "GUARD")
      .order("display_order");

    if (modulesError) {
      console.error("[GuardModuleSettings] Error fetching modules:", modulesError);
      return null;
    }

    let overridesByModuleId = {};
    if (communityId) {
      const { data: communityOverrides, error: overridesError } = await supabase
        .from("community_module_overrides")
        .select("module_id, status")
        .eq("community_id", communityId);

      if (overridesError) {
        console.error("[GuardModuleSettings] Error fetching module overrides:", overridesError);
      } else if (communityOverrides) {
        overridesByModuleId = communityOverrides.reduce((acc, override) => {
          acc[override.module_id] = override.status;
          return acc;
        }, {});
      }
    }

    const modulesMap = {};
    (modules || []).forEach((module) => {
      const effectiveStatus =
        overridesByModuleId[module.id] !== undefined
          ? overridesByModuleId[module.id]
          : module.status;

      modulesMap[module.slug] = {
        ...module,
        effective_status: effectiveStatus,
        is_enabled: effectiveStatus === 1,
      };
    });

    warnOnModuleMapDrift(modulesMap);
    return modulesMap;
  } catch (error) {
    console.error("[GuardModuleSettings] Unexpected module fetch error:", error);
    return null;
  }
}

function setActiveMemoryEntry(scopeKey, entry) {
  memoryCacheByScope.set(scopeKey, entry);
  activeScopeKey = scopeKey;
}

function getActiveModules() {
  if (!activeScopeKey) return null;
  const entry = memoryCacheByScope.get(activeScopeKey);
  return entry?.modules || null;
}

export async function loadModuleSettings(communityId = null, forceRefresh = false) {
  const context = await resolveModuleContext(communityId);
  const scopeKey = buildScopeKey(context);

  if (!forceRefresh) {
    const memoryEntry = memoryCacheByScope.get(scopeKey);
    if (memoryEntry && !isExpired(memoryEntry.timestamp)) {
      activeScopeKey = scopeKey;
      return memoryEntry.modules;
    }

    const cachedEntry = await readScopedCache(scopeKey, false);
    if (cachedEntry) {
      setActiveMemoryEntry(scopeKey, cachedEntry);
      return cachedEntry.modules;
    }
  }

  const freshModules = await fetchModulesFromDB(context);
  if (freshModules) {
    const freshEntry = toCacheEntry(freshModules);
    setActiveMemoryEntry(scopeKey, freshEntry);
    await writeScopedCache(scopeKey, freshModules);
    return freshModules;
  }

  const staleMemoryEntry = memoryCacheByScope.get(scopeKey);
  if (staleMemoryEntry) {
    activeScopeKey = scopeKey;
    console.warn("[GuardModuleSettings] Using stale in-memory module cache");
    return staleMemoryEntry.modules;
  }

  const staleDiskEntry = await readScopedCache(scopeKey, true);
  if (staleDiskEntry) {
    setActiveMemoryEntry(scopeKey, staleDiskEntry);
    console.warn("[GuardModuleSettings] Using stale disk module cache");
    return staleDiskEntry.modules;
  }

  setActiveMemoryEntry(scopeKey, toCacheEntry({}));
  console.warn(
    "[GuardModuleSettings] No module settings available; known modules are treated as disabled"
  );
  return {};
}

export function isModuleEnabled(slug) {
  const modules = getActiveModules();

  if (!modules) {
    return !KNOWN_MODULE_SLUGS.has(slug);
  }

  const module = modules[slug];
  if (!module) {
    return !KNOWN_MODULE_SLUGS.has(slug);
  }

  return module.is_enabled === true;
}

export function isScreenEnabled(screenName) {
  const slug = SCREEN_TO_MODULE_MAP[screenName];
  if (!slug) return true;
  return isModuleEnabled(slug);
}

export function getEnabledModulesForHub(hubType) {
  const modules = getActiveModules();
  if (!modules) return [];

  return Object.values(modules)
    .filter((module) => module.hub_type === hubType && module.is_enabled)
    .map((module) => module.slug);
}

export function getModuleInfo(slug) {
  const modules = getActiveModules();
  if (!modules) return null;
  return modules[slug] || null;
}

export async function clearModuleCache() {
  activeScopeKey = null;
  memoryCacheByScope.clear();

  try {
    const scopedKeys = await getCacheIndex();
    if (scopedKeys.length > 0) {
      await AsyncStorage.multiRemove(scopedKeys);
    }
    await AsyncStorage.multiRemove([CACHE_INDEX_KEY, LEGACY_CACHE_KEY]);
  } catch (error) {
    console.error("[GuardModuleSettings] Cache clear error:", error);
  }
}

export default {
  loadModuleSettings,
  isModuleEnabled,
  isScreenEnabled,
  getEnabledModulesForHub,
  clearModuleCache,
  getModuleInfo,
  MODULE_SLUGS,
  SCREEN_TO_MODULE_MAP,
};
