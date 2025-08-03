import { Button } from "@/components/ui/button";
import { MapPin, BookOpen, Star } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
const Navbar = () => {
  const location = useLocation();
  return <nav className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="text-3xl animate-shake">🍹</div>
            <span className="text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent">The BEST Margaritas near me</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
              <MapPin className="w-4 h-4" />
              Find Bars
            </Link>
            
            <Link to="/recipes" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${location.pathname === '/recipes' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
              <BookOpen className="w-4 h-4" />
              Recipes
            </Link>

            <Button variant="festive" className="font-bold">
              <Star className="w-4 h-4" />
              Rate a Drink
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              ☰
            </Button>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;