import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  MapPin, 
  BookOpen, 
  Star, 
  Menu, 
  PartyPopper, 
  Trophy, 
  Calendar, 
  Facebook, 
  Camera 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import margaritaMapLogo from "@/assets/margarita-map-logo.jpg";
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

      <Link 
        to="/party-central" 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium whitespace-nowrap ${
          location.pathname === '/party-central' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <PartyPopper className="w-5 h-5" />
        <span>PARTY Central</span>
      </Link>

      <Link 
        to="/photo-gallery" 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium whitespace-nowrap ${
          location.pathname === '/photo-gallery' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Camera className="w-5 h-5" />
        <span className="hidden lg:inline">Photo Gallery</span>
        <span className="lg:hidden">Photos</span>
      </Link>

      <Link 
        to="/tequila-brands" 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium whitespace-nowrap ${
          location.pathname === '/tequila-brands' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="hidden lg:inline">Vote For Your Favorite Tequila</span>
        <span className="lg:hidden">Tequila Brands</span>
      </Link>

      <Link 
        to="/tequila-events" 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium ${
          location.pathname === '/tequila-events' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Calendar className="w-5 h-5" />
        Tequila Events
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
            <img 
              src="/lovable-uploads/52d9a7ef-79d5-4e08-8f60-652a639ee6bb.png" 
              alt="Margarita Map Logo" 
              className="h-8 md:h-10 object-contain"
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 overflow-x-auto">
            <NavLinks />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.open('https://www.facebook.com/margaritamap', '_blank')}
              className="flex items-center gap-2"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
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
                <Button 
                  variant="ghost" 
                  onClick={() => window.open('https://www.facebook.com/margaritamap', '_blank')}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium hover:bg-accent hover:text-accent-foreground justify-start"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;