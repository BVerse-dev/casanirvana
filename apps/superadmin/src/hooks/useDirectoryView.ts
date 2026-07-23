"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type DirectoryViewMode = "grid" | "list";

const isViewMode = (value: string | null): value is DirectoryViewMode => value === "grid" || value === "list";

export const useDirectoryView = (resourceKey: string) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const [view, setViewState] = useState<DirectoryViewMode>(isViewMode(requestedView) ? requestedView : "grid");
  const storageKey = `casa-nirvana:directory-view:${resourceKey}`;

  const replaceView = useCallback((nextView: DirectoryViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (isViewMode(requestedView)) {
      setViewState(requestedView);
      window.localStorage.setItem(storageKey, requestedView);
      return;
    }

    const savedView = window.localStorage.getItem(storageKey);
    const nextView: DirectoryViewMode = requestedView === null && isViewMode(savedView) ? savedView : "grid";
    setViewState(nextView);
    replaceView(nextView);
  }, [replaceView, requestedView, storageKey]);

  const setView = useCallback((nextView: DirectoryViewMode) => {
    setViewState(nextView);
    window.localStorage.setItem(storageKey, nextView);
    replaceView(nextView);
  }, [replaceView, storageKey]);

  return { view, setView };
};
