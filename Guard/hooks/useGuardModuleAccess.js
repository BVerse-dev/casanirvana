import { useEffect, useState } from "react";
import { useGuardAuth } from "../contexts/GuardAuthContext";
import {
  loadModuleSettings,
  isModuleEnabled,
  MODULE_SLUGS,
} from "../services/moduleSettingsService";

export const useGuardModuleAccess = (moduleSlug) => {
  const { guard, user, isAuthenticated } = useGuardAuth();
  const [modulesLoaded, setModulesLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    const resolveAccess = async () => {
      if (!isAuthenticated) {
        if (mounted) {
          setModulesLoaded(true);
          setEnabled(false);
        }
        return;
      }

      setModulesLoaded(false);

      try {
        await loadModuleSettings(guard?.community_id || user?.community_id || null);
        if (mounted) {
          setEnabled(isModuleEnabled(moduleSlug));
        }
      } finally {
        if (mounted) {
          setModulesLoaded(true);
        }
      }
    };

    resolveAccess();

    return () => {
      mounted = false;
    };
  }, [guard?.community_id, isAuthenticated, moduleSlug, user?.community_id]);

  return {
    modulesLoaded,
    enabled,
  };
};

export { MODULE_SLUGS };
