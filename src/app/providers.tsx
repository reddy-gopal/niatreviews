"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { AuthProvider } from "@/context/AuthContext";
import { getFAQs } from "@/lib/api";

function FAQPrefetcher() {
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ["faqs"], queryFn: getFAQs });
  }, [queryClient]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000 },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <FAQPrefetcher />
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
