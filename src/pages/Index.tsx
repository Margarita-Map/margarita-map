import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Star, Utensils, Car, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import ReviewCard from "@/components/ReviewCard";
import AddEstablishmentForm from "@/components/AddEstablishmentForm";
import DrinkSpecialsList from "@/components/DrinkSpecialsList";
import ManageEstablishment from "@/components/ManageEstablishment";
import TequilaTrivia from "@/components/TequilaTrivia";
import heroImage from "@/assets/hero-margarita.jpg";
import partyCharacter from "@/assets/party-character-sunglasses.jpg";
import celebrationImage from "@/assets/celebration-margaritas.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showManageForm, setShowManageForm] = useState(false);

  useSEO({
    title: "Find the Best Margaritas Near Me | Honest Reviews & Bar Locator",
    description: "Discover top-rated margaritas with our honest agave rating system. Find bars near you, read real reviews, get rideshare links, and explore the best margarita spots in your area.",
    keywords: "margaritas near me, best margarita bars, margarita reviews, cocktail bars, agave rating, bar locator, rideshare to bars"
  });

  return <div className="min-h-screen bg-gradient-tropical">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 md:py-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }}>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="text-xl md:text-2xl text-green-400 mb-4 font-medium tracking-wide">
            The Official Drink of Fun
          </p>
          <div className="animate-float mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-6 mb-4">
            <img 
              src={partyCharacter} 
              alt="Party character holding margarita" 
              className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full border-2 border-white/30 shadow-lg animate-bounce" 
            />
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-sunset bg-clip-text text-transparent mt-2">
                Margarita 🍹
              </span>
            </h1>
            <img 
              src={partyCharacter} 
              alt="Party character holding margarita" 
              className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full border-2 border-white/30 shadow-lg animate-bounce" 
              style={{ animationDelay: '0.5s' }}
            />
            </div>
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto drop-shadow-lg leading-relaxed px-4">Discover the best margaritas anywhere in the world. Rate drinks with our agave scale and find your next favorite spot! Let your favorite bartender and establishment know how much you appreciate them.</p>
          
          <div className="max-w-2xl mx-auto px-4">
            <Button variant="lime" size="lg" className="font-bold w-full sm:w-auto" onClick={() => navigate('/rate-drink')}>
              Start Rating Margaritas
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-white/70 text-sm text-center px-4">Scroll to explore</div>
        </div>
      </section>

      {/* Drink Specials Section */}
      <section data-section="drink-specials" className="py-12 md:py-20 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Today's Drink Specials 🍸
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Check out the best drink deals happening right now at establishments near you.
              </p>
            </div>
            <Button variant="tropical" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/party-central')}>
              <Utensils className="w-5 h-5" />
              View All Specials
            </Button>
          </div>
          <div className="max-w-4xl mx-auto">
            <DrinkSpecialsList restaurantIds={[]} maxItems={8} />
          </div>
        </div>
      </section>

      {/* Tequila Trivia Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Test Your Tequila Knowledge! 🧠
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Think you know your tequila? Take our fun trivia challenge and learn fascinating facts!
            </p>
          </div>
          <TequilaTrivia />
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Recent Reviews 📝
            </h2>
            <Button variant="festive" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/rate-drink')}>
              <Star className="w-5 h-5" />
              Write a Review
            </Button>
          </div>
          
          <div className="text-center py-8">
            <p className="text-muted-foreground">Check out our amazing review system - rate margaritas and help others find the best spots!</p>
          </div>
        </div>
      </section>

      {/* Add Establishment Section */}
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              For Bar & Restaurant Owners 🏪
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Add your establishment to our directory and manage your daily drink specials to attract more customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button variant="tropical" size="lg" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? "Hide Form" : "Add Your Establishment"}
              </Button>
              <Button variant="festive" size="lg" onClick={() => setShowManageForm(!showManageForm)}>
                {showManageForm ? "Hide Management" : "Manage Specials"}
              </Button>
            </div>
          </div>
          
          {showAddForm && <div className="animate-in slide-in-from-top duration-300 mb-8">
              <AddEstablishmentForm onSuccess={() => setShowAddForm(false)} />
            </div>}

          {showManageForm && <div className="animate-in slide-in-from-top duration-300">
              <ManageEstablishment />
            </div>}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 md:py-20 bg-gradient-sunset">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Ready to Find Your Perfect Margarita? 🍹
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of margarita enthusiasts discovering amazing drinks and sharing honest reviews.
          </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button variant="lime" size="lg" className="font-bold w-full sm:w-auto" onClick={() => navigate('/rate-drink')}>
               Start Rating
             </Button>
             <Button variant="tropical" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/rate-drink')}>
               Share Your Review
             </Button>
           </div>
        </div>
      </section>

      {/* Rideshare Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl md:text-3xl font-bold">
                Please Drive Responsibly
              </h2>
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Enjoying margaritas? Make the smart choice and get a safe ride home. 
              Your safety and the safety of others matters.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button variant="outline" size="lg" onClick={() => window.open('https://m.uber.com/', '_blank')} className="bg-black text-white hover:bg-black/80 font-medium h-14">
                <Car className="w-5 h-5 mr-3" />
                Get an Uber
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.open('https://lyft.com/', '_blank')} className="bg-[#FF00BF] text-white hover:bg-[#FF00BF]/80 font-medium h-14">
                <Car className="w-5 h-5 mr-3" />
                Get a Lyft
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-6 italic">
              "The best nights are the ones you remember safely getting home from."
            </p>
          </div>
        </div>
      </section>

      {/* Powered by SWEENY */}
      <section className="py-8 bg-background text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-red-600">
          Powered by SWEENY
        </h3>
      </section>

      {/* Bottom Image Section */}
      <section className="pb-0">
        <div className="w-full h-96 relative overflow-hidden">
          <img src={celebrationImage} alt="Friends celebrating with margaritas" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </section>
    </div>;
};

export default Index;