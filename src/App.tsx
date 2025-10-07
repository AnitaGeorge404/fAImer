import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConvexProvider } from "convex/react";
import { convex } from "./lib/convex";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { CachePreloader } from "./components/CachePreloader";
import { initializeUnifiedAI } from "./lib/unifiedAI";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Import test utilities in development
if (import.meta.env.MODE === "development") {
  import("./utils/testOfflineAI");
}

const queryClient = new QueryClient();

// Initialize the unified AI system on app start
initializeUnifiedAI().catch((error) => {
  console.warn("Failed to initialize unified AI:", error);
});

const App = () => (
  <ConvexProvider client={convex}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <CachePreloader />
            <OfflineIndicator />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ConvexProvider>
);

export default App;
