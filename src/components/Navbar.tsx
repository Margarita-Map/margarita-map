import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MapPin, BookOpen, Star, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
const Navbar = () => {
  const location = useLocation();
  
  const NavLinks = () => (
    <>
      <Link 
        to="/" 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium ${
          location.pathname === '/' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <MapPin className="w-5 h-5" />
        Find Bars
      </Link>
      
      <Link 
        to="/recipes" 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium ${
          location.pathname === '/recipes' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        Recipes
      </Link>

      <Link to="/rate-drink">
        <Button variant="festive" className="font-bold w-full md:w-auto justify-center md:justify-start" size="lg">
          <Star className="w-5 h-5" />
          Rate a Drink
        </Button>
      </Link>
    </>
  );

  return (
    <nav className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className="text-2xl md:text-3xl animate-shake">🍹</div>
            <span className="text-lg md:text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent leading-tight">
              <span className="hidden sm:inline">The BEST Margaritas near me</span>
              <span className="sm:hidden">Margarita Quest</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="lg" className="md:hidden p-2">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;