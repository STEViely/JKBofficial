import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useMemo } from "react";
import { LangContext, translations, Lang } from "@/lib/i18n";

import Index from "./pages/Index";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Download from "./pages/Download";
import EventGallery from "./pages/EventGallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [lang, setLang] = useState<Lang>("th");

  const langValue = useMemo(
    () => ({
      lang,
      setLang,
      t: translations[lang],
    }),
    [lang],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LangContext.Provider value={langValue}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Home */}
              <Route path="/" element={<Index />} />

              {/* About */}
              <Route path="/about" element={<About />} />

              {/* Portfolio */}
              <Route path="/portfolio" element={<Portfolio />} />

              {/* Download landing page */}
              <Route path="/download" element={<Download />} />

              {/* Dynamic gallery page (Google Drive folderId) */}
              <Route path="/download/:folderId" element={<EventGallery />} />

              {/* Contact */}
              <Route path="/contact" element={<Contact />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LangContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
