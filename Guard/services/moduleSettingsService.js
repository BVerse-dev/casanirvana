/**
 * Module Settings Service for Guard App
 * Fetches module configuration from backend API and caches locally
 * Controls feature visibility based on admin settings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabase configuration
const SUPABASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing:', { SUPABASE_URL, SUPABASE_ANON_KEY });
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CACHE_KEY = 'casa_nirvana_guard_module_settings';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Guard module slugs
 */
export const MODULE_SLUGS = {
    VISITOR_ENTRY: 'visitor_entry',
    DELIVERY_ENTRY: 'delivery_entry',
    CAB_ENTRY: 'cab_entry',
    SERVICE_ENTRY: 'service_entry',
    EMERGENCY_ALERTS: 'emergency_alerts',
    RESIDENT_DIRECTORY: 'resident_directory',
};

/**
 * Map screen names to module slugs
 */
export const SCREEN_TO_MODULE_MAP = {
    guestEntryScreen: MODULE_SLUGS.VISITOR_ENTRY,
    deliveryEntryScreen: MODULE_SLUGS.DELIVERY_ENTRY,
    cabEntryScreen: MODULE_SLUGS.CAB_ENTRY,
    serviceEntryScreen: MODULE_SLUGS.SERVICE_ENTRY,
    emergencyAlertsScreen: MODULE_SLUGS.EMERGENCY_ALERTS,
    residentDirectoryScreen: MODULE_SLUGS.RESIDENT_DIRECTORY,
};

// In-memory cache
let moduleCache = null;
let cacheTimestamp = null;

/**
 * Fetch module settings from Supabase
 */
async function fetchModulesFromAPI(communityId = null) {
    try {
        let query = supabase
            .from('module_settings')
            .select('*')
            .eq('user_type', 'GUARD')
            .order('display_order');

        const { data: modules, error: modulesError } = await query;

        if (modulesError) {
            console.error('[GuardModuleSettings] Error fetching modules:', modulesError);
            return null;
        }

        // If community ID provided, fetch overrides
        let overrides = {};
        if (communityId) {
            const { data: communityOverrides, error: overridesError } = await supabase
                .from('community_module_overrides')
                .select('module_id, status')
                .eq('community_id', communityId);

            if (!overridesError && communityOverrides) {
                overrides = communityOverrides.reduce((acc, override) => {
                    acc[override.module_id] = override.status;
                    return acc;
                }, {});
            }
        }

        // Create lookup map
        const modulesMap = {};
        (modules || []).forEach((module) => {
            const effectiveStatus = overrides[module.id] !== undefined
                ? overrides[module.id]
                : module.status;

            modulesMap[module.slug] = {
                ...module,
                effective_status: effectiveStatus,
                is_enabled: effectiveStatus === 1,
            };
        });

        return modulesMap;
    } catch (error) {
        console.error('[GuardModuleSettings] API fetch error:', error);
        return null;
    }
}

/**
 * Get cached modules from AsyncStorage
 */
async function getCachedModules() {
    try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
            const { modules, timestamp } = JSON.parse(cached);
            const isExpired = Date.now() - timestamp > CACHE_EXPIRY_MS;
            if (!isExpired) {
                return modules;
            }
        }
        return null;
    } catch (error) {
        console.error('[GuardModuleSettings] Cache read error:', error);
        return null;
    }
}

/**
 * Save modules to AsyncStorage cache
 */
async function setCachedModules(modules) {
    try {
        const cacheData = {
            modules,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('[GuardModuleSettings] Cache write error:', error);
    }
}

/**
 * Load module settings
 */
export async function loadModuleSettings(communityId = null, forceRefresh = false) {
    // Return in-memory cache if valid
    if (!forceRefresh && moduleCache && cacheTimestamp) {
        const isExpired = Date.now() - cacheTimestamp > CACHE_EXPIRY_MS;
        if (!isExpired) {
            return moduleCache;
        }
    }

    // Try AsyncStorage cache
    if (!forceRefresh) {
        const cached = await getCachedModules();
        if (cached) {
            moduleCache = cached;
            cacheTimestamp = Date.now();
            return cached;
        }
    }

    // Fetch from API
    const modules = await fetchModulesFromAPI(communityId);

    if (modules) {
        moduleCache = modules;
        cacheTimestamp = Date.now();
        await setCachedModules(modules);
        return modules;
    }

    // Fallback: use expired cache
    const expiredCache = await getCachedModules();
    if (expiredCache) {
        console.warn('[GuardModuleSettings] Using expired cache');
        moduleCache = expiredCache;
        return expiredCache;
    }

    console.warn('[GuardModuleSettings] No cache, enabling all modules');
    return null;
}

/**
 * Check if a module is enabled
 */
export function isModuleEnabled(slug) {
    if (!moduleCache) {
        return true; // Fail-open
    }
    const module = moduleCache[slug];
    return module ? module.is_enabled : true;
}

/**
 * Check if a screen should be accessible
 */
export function isScreenEnabled(screenName) {
    const slug = SCREEN_TO_MODULE_MAP[screenName];
    if (!slug) return true;
    return isModuleEnabled(slug);
}

/**
 * Get all enabled modules
 */
export function getEnabledModules() {
    if (!moduleCache) return [];
    return Object.values(moduleCache)
        .filter(module => module.is_enabled)
        .map(module => module.slug);
}

/**
 * Clear module cache
 */
export async function clearModuleCache() {
    moduleCache = null;
    cacheTimestamp = null;
    try {
        await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
        console.error('[GuardModuleSettings] Clear error:', error);
    }
}

export default {
    loadModuleSettings,
    isModuleEnabled,
    isScreenEnabled,
    getEnabledModules,
    clearModuleCache,
    MODULE_SLUGS,
    SCREEN_TO_MODULE_MAP,
};
