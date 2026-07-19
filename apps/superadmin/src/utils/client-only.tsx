'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to check if code is running on client side
 * Helps prevent hydration mismatches and SSR issues
 */
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Component that only renders children on client side
 * Useful for components that use window, document, or other browser APIs
 */
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
  const isClient = useIsClient();

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Higher-order component that makes a component client-only
 */
export const withClientOnly = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ClientOnly fallback={fallback}>
      <Component {...props} />
    </ClientOnly>
  );
  
  WrappedComponent.displayName = `withClientOnly(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Safe window object that won't cause SSR issues
 */
export const safeWindow = typeof window !== 'undefined' ? window : undefined;

/**
 * Safe document object that won't cause SSR issues
 */
export const safeDocument = typeof document !== 'undefined' ? document : undefined;

/**
 * Safe navigator object that won't cause SSR issues
 */
export const safeNavigator = typeof navigator !== 'undefined' ? navigator : undefined;
