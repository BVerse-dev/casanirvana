"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify";
import { DEFAULT_PAGE_TITLE } from "@/context/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dynamic from "next/dynamic";
const LayoutProvider = dynamic(
  () => import("@/context/useLayoutContext").then((mod) => mod.LayoutProvider),
  {
    ssr: false,
  },
);
import { NotificationProvider } from "@/context/useNotificationContext";
import { ChildrenType } from "@/types/component-props";
import { supabase } from "@/lib/supabase";
import ClientMonitoringProvider from "./ClientMonitoringProvider";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const SupabaseSessionSync = () => {
  const { data: session } = useSession();
  const lastAccessToken = useRef<string | null>(null);

  useEffect(() => {
    const accessToken = session?.accessToken;
    const refreshToken = session?.refreshToken;
    if (!accessToken || !refreshToken) return;
    if (lastAccessToken.current === accessToken) return;

    lastAccessToken.current = accessToken;
    supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(({ error }) => {
        if (!error) {
          queryClient.invalidateQueries();
        }
      })
      .catch(() => {
        // No-op: if this fails, queries will be denied by RLS anyway.
      });
  }, [session?.accessToken, session?.refreshToken]);

  return null;
};

const AppProvidersWrapper = ({ children }: ChildrenType) => {

  const handleChangeTitle = () => {
    if (document.visibilityState == "hidden")
      document.title = "Please come back 🥺";
    else document.title = DEFAULT_PAGE_TITLE;
  };

  useEffect(() => {
    // Remove splash screen once content is loaded
    const timer = setTimeout(() => {
      const splashScreen = document.querySelector("#splash-screen");
      if (splashScreen) {
        splashScreen.classList.add("remove");
      }
    }, 500); // Slightly longer delay for smooth transition

    // Handle document visibility changes
    document.addEventListener("visibilitychange", handleChangeTitle);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleChangeTitle);
    };
  }, []);

  return (
    <SessionProvider>
      <SupabaseSessionSync />
      <QueryClientProvider client={queryClient}>
        <LayoutProvider>
          <ClientMonitoringProvider>
            <NotificationProvider>
              {children}
              <ToastContainer theme="colored" />
            </NotificationProvider>
          </ClientMonitoringProvider>
        </LayoutProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
};
export default AppProvidersWrapper;
