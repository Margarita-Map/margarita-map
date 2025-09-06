
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Recipes from "./pages/Recipes";
import RateDrink from "./pages/RateDrink";
import PartyCentral from "./pages/PartyCentral";
import PartyDetails from "./pages/PartyDetails";
import PhotoGallery from "./pages/PhotoGallery";
import TequilaBrands from "./pages/TequilaBrands";
import TequilaEvents from "./pages/TequilaEvents";
import EstablishmentDetails from "./pages/EstablishmentDetails";
import MargaritaGame from "./pages/MargaritaGame";
import ShellGame from "./pages/ShellGame";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/rate-drink" element={<RateDrink />} />
          <Route path="/party-central" element={<PartyCentral />} />
          <Route path="/party/:id" element={<PartyDetails />} />
          <Route path="/photo-gallery" element={<PhotoGallery />} />
          <Route path="/tequila-brands" element={<TequilaBrands />} />
          <Route path="/tequila-events" element={<TequilaEvents />} />
          <Route path="/establishment/:id" element={<EstablishmentDetails />} />
          <Route path="/margarita-game" element={<MargaritaGame />} />
          <Route path="/shell-game" element={<ShellGame />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
