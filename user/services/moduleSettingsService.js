/**
 * Module Settings Service for User App
 * - Uses canonical Supabase client (auth-aware)
 * - Uses scoped cache (user + user_type + community)
 * - Fail-closed for known module slugs when no reliable data is available
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../utils/supabase";
import { getProfileByAuthId } from "../utils/profileResolver";

const CACHE_KEY_PREFIX = "casa_nirvana_module_settings";
const CACHE_INDEX_KEY = `${CACHE_KEY_PREFIX}:keys`;
const LEGACY_CACHE_KEY = "casa_nirvana_module_settings";
const CACHE_EXPIRY_MS = 30 * 1000; // 30 seconds for fast module updates

/**
 * Module slugs mapping to screen navigation keys
 */
export const MODULE_SLUGS = {
  // Community Hub
  MEMBERS_DIRECTORY: "members_directory",
  VISITORS_MANAGEMENT: "visitors_management",
  NOTICE_BOARD: "notice_board",
  PAYMENT: "payment",
  BOOK_AMENITIES: "book_amenities",
  HELP_DESK: "help_desk",
  COMPLAINTS: "complaints",
  MAINTENANCE_REQUESTS: "maintenance_requests",
  SERVICES: "services",

  // Personal Hub
  BUY_AIRTIME: "buy_airtime",
  BUY_DATA: "buy_data",
  SEND_MONEY: "send_money",
  PAY_BILLS: "pay_bills",
  INSURANCE: "insurance",
  MARKETPLACE: "marketplace",
};

/**
 * Map screen names to module slugs
 */
export const SCREEN_TO_MODULE_MAP = {
  // Community Hub screens
  communityMemberScreen: MODULE_SLUGS.MEMBERS_DIRECTORY,
  visitorsScreen: MODULE_SLUGS.VISITORS_MANAGEMENT,
  noticeBoardScreen: MODULE_SLUGS.NOTICE_BOARD,
  paymentScreen: MODULE_SLUGS.PAYMENT,
  bookedAmenitiesScreen: MODULE_SLUGS.BOOK_AMENITIES,
  helpDeskScreen: MODULE_SLUGS.HELP_DESK,
  complaintsScreen: MODULE_SLUGS.COMPLAINTS,
  MaintenanceRequestsScreen: MODULE_SLUGS.MAINTENANCE_REQUESTS,
  serviceProvidersScreen: MODULE_SLUGS.SERVICES,

  // Personal Hub screens
  airtimeScreen: MODULE_SLUGS.BUY_AIRTIME,
  dataScreen: MODULE_SLUGS.BUY_DATA,
  transferScreen: MODULE_SLUGS.SEND_MONEY,
  payBillsScreen: MODULE_SLUGS.PAY_BILLS,
  insuranceScreen: MODULE_SLUGS.INSURANCE,
  marketplaceHomeScreen: MODULE_SLUGS.MARKETPLACE,
};

const KNOWN_MODULE_SLUGS = new Set(Object.values(MODULE_SLUGS));

// In-memory cache per scopeKey
const memoryCacheByScope = new Map();
let activeScopeKey = null;
let lastResolvedContext = null;
const reportedDriftWarnings = new Set();

const normalizeUserType = (role) =>
  String(role || "").toLowerCase() === "guard" ? "GUARD" : "RESIDENT";

const buildScopeKey = ({ authUserId, userType, communityId }) =>
  [authUserId || "anonymous", userType || "RESIDENT", communityId || "global"].join(":");

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
    console.error("[ModuleSettings] Cache index read error:", error);
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
    console.error("[ModuleSettings] Cache index write error:", error);
  }
}

async function readScopedCache(scopeKey, allowExpired = false) {
  const storageKey = buildStorageKey(scopeKey);

  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.modules || !parsed?.timestamp) return null;

    if (!allowExpired && isExpired(parsed.timestamp)) {
      return null;
    }

    return toCacheEntry(parsed.modules, parsed.timestamp);
  } catch (error) {
    console.error("[ModuleSettings] Scoped cache read error:", error);
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
    console.error("[ModuleSettings] Scoped cache write error:", error);
  }
}

async function resolveModuleContext(communityIdOverride = null) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[ModuleSettings] Failed to resolve auth user:", userError);
  }

  if (!user) {
    lastResolvedContext = null;
    return {
      authUserId: null,
      communityId: communityIdOverride || null,
      userType: "RESIDENT",
    };
  }

  let profile = null;
  try {
    profile = await getProfileByAuthId(user.id, "id, user_id, role, community_id");
  } catch (error) {
    console.error("[ModuleSettings] Failed to resolve profile context:", error);
  }

  const fallbackContext =
    lastResolvedContext && lastResolvedContext.authUserId === user.id
      ? lastResolvedContext
      : null;

  const resolvedContext = {
    authUserId: user.id,
    communityId:
      communityIdOverride || profile?.community_id || fallbackContext?.communityId || null,
    userType: normalizeUserType(profile?.role || fallbackContext?.userType),
  };

  lastResolvedContext = resolvedContext;
  return resolvedContext;
}

function warnOnModuleMapDrift(userType, modulesMap) {
  const loadedSlugs = new Set(Object.keys(modulesMap || {}));
  const expectedSlugs = [...KNOWN_MODULE_SLUGS];

  const missingInDb = expectedSlugs.filter((slug) => !loadedSlugs.has(slug));
  const unmappedInCode = [...loadedSlugs].filter((slug) => !KNOWN_MODULE_SLUGS.has(slug));
  const signature = `${userType}|${missingInDb.join(",")}|${unmappedInCode.join(",")}`;

  if (reportedDriftWarnings.has(signature)) {
    return;
  }
  reportedDriftWarnings.add(signature);

  if (missingInDb.length > 0) {
    console.warn(
      `[ModuleSettings] Missing expected module slugs for ${userType}: ${missingInDb.join(", ")}`
    );
  }

  if (unmappedInCode.length > 0) {
    console.warn(
      `[ModuleSettings] Unmapped module slugs from DB for ${userType}: ${unmappedInCode.join(", ")}`
    );
  }
}

async function fetchModulesFromDB(context) {
  try {
    const { communityId, userType } = context;

    const { data: modules, error: modulesError } = await supabase
      .from("module_settings")
      .select("*")
      .eq("user_type", userType)
      .order("display_order");

    if (modulesError) {
      console.error("[ModuleSettings] Error fetching modules:", modulesError);
      return null;
    }

    let overridesByModuleId = {};
    if (communityId) {
      const { data: communityOverrides, error: overridesError } = await supabase
        .from("community_module_overrides")
        .select("module_id, status")
        .eq("community_id", communityId);

      if (overridesError) {
        console.error("[ModuleSettings] Error fetching module overrides:", overridesError);
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

    warnOnModuleMapDrift(userType, modulesMap);
    return modulesMap;
  } catch (error) {
    console.error("[ModuleSettings] Unexpected module fetch error:", error);
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

/**
 * Load module settings.
 * @param {string|null} communityId - optional community override
 * @param {boolean} forceRefresh - bypass cache when true
 */
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
    console.warn("[ModuleSettings] Using stale in-memory module cache");
    return staleMemoryEntry.modules;
  }

  const staleDiskEntry = await readScopedCache(scopeKey, true);
  if (staleDiskEntry) {
    setActiveMemoryEntry(scopeKey, staleDiskEntry);
    console.warn("[ModuleSettings] Using stale disk module cache");
    return staleDiskEntry.modules;
  }

  // Fail-closed for known module slugs when no reliable module data exists.
  setActiveMemoryEntry(scopeKey, toCacheEntry({}));
  console.warn("[ModuleSettings] No module settings available; known modules are treated as disabled");
  return {};
}

/**
 * Check if a specific module is enabled.
 * Known module slugs fail closed when module cache is missing.
 */
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

/**
 * Check if a screen should be accessible based on module settings.
 */
export function isScreenEnabled(screenName) {
  const slug = SCREEN_TO_MODULE_MAP[screenName];
  if (!slug) {
    return true;
  }
  const enabled = isModuleEnabled(slug);
  return enabled;
}

/**
 * Get all enabled modules for a specific hub.
 */
export function getEnabledModulesForHub(hubType) {
  const modules = getActiveModules();
  if (!modules) return [];

  return Object.values(modules)
    .filter((module) => module.hub_type === hubType && module.is_enabled)
    .map((module) => module.slug);
}

/**
 * Get module info by slug.
 */
export function getModuleInfo(slug) {
  const modules = getActiveModules();
  if (!modules) return null;
  return modules[slug] || null;
}

/**
 * Clear module cache (logout or explicit refresh reset).
 */
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
    console.error("[ModuleSettings] Cache clear error:", error);
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
