import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Star, Utensils, Car, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import ReviewCard from "@/components/ReviewCard";
import RecentReviews from "@/components/RecentReviews";
import AddEstablishmentForm from "@/components/AddEstablishmentForm";
import DrinkSpecialsList from "@/components/DrinkSpecialsList";
import ManageEstablishment from "@/components/ManageEstablishment";
import TequilaTrivia from "@/components/TequilaTrivia";
import LocationSearch from "@/components/LocationSearch";
import SimpleMariachiBand from "@/components/SimpleMariachiBand";
import WeeklySpotlight from "@/components/WeeklySpotlight";
import heroImage from "/lovable-uploads/3a617b49-e4d5-47fa-860b-07b083b031f1.png";
import partyCharacter from "@/assets/party-character-sunglasses.jpg";
import celebrationImage from "/lovable-uploads/3a617b49-e4d5-47fa-860b-07b083b031f1.png";
import margaritaMapLogo from "@/assets/margarita-map-logo.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showManageForm, setShowManageForm] = useState(false);
  useSEO({
    title: "Margarita Map | Find the Best Margaritas Near You Worldwide",
    description: "Discover top-rated margaritas with Margarita Map's honest agave rating system. Find bars near you, read real reviews, get rideshare links, and explore the best margarita spots worldwide. Your ultimate guide to margarita bars, happy hours, and drink specials.",
    keywords: "margarita map, maps of the world, the best margaritas near me, margaritas, tequila companies, party planner, mexican food, margaritas near me, best margarita bars worldwide, margarita reviews, cocktail bars, agave rating, bar locator, happy hour, drink specials, tequila bars, mexican restaurants, rideshare to bars",
    canonicalUrl: "https://margaritamap.com/",
    image: "https://margaritamap.com/og-image.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Margarita Map",
      "description": "Discover top-rated margaritas with honest reviews and agave ratings. Find bars near you worldwide.",
      "url": "https://margaritamap.com",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Organization",
        "name": "Margarita Map",
        "url": "https://margaritamap.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Margarita Map",
        "logo": {
          "@type": "ImageObject",
          "url": "https://margaritamap.com/logo.jpg"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "10000",
        "bestRating": "5",
        "worstRating": "1"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://margaritamap.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  });
  return <div className="min-h-screen bg-gradient-neon">
      <Navbar />
      
      {/* Hero Video Section with Logo and Banner */}
      <section className="relative bg-gradient-electric border-y-8 border-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-[50vh] md:h-[60vh] object-cover opacity-30"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Logo and Scrolling Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4">
          {/* Logo */}
          <div className="card-brutal p-4 bg-white">
            <img 
              src="/lovable-uploads/52d9a7ef-79d5-4e08-8f60-652a639ee6bb.png" 
              alt="Margarita Map Logo" 
              className="h-16 md:h-24 object-contain"
            />
          </div>
          
          {/* Scrolling Text */}
          <div className="w-full max-w-6xl bg-black border-4 border-black p-4 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-2xl md:text-4xl font-black text-primary mx-8">
                🍹 WELCOME TO MARGARITA MAP 🍹 YOUR GUIDE TO THE BEST DRINKS AND ESTABLISHMENTS AROUND THE WORLD 🍹
              </span>
              <span className="text-2xl md:text-4xl font-black text-secondary mx-8">
                🍹 WELCOME TO MARGARITA MAP 🍹 YOUR GUIDE TO THE BEST DRINKS AND ESTABLISHMENTS AROUND THE WORLD 🍹
              </span>
              <span className="text-2xl md:text-4xl font-black text-accent mx-8">
                🍹 WELCOME TO MARGARITA MAP 🍹 YOUR GUIDE TO THE BEST DRINKS AND ESTABLISHMENTS AROUND THE WORLD 🍹
              </span>
            </div>
          </div>
        </div>
      </section>
      
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 md:py-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }}>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="animate-float mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-6 mb-4">
            
            
            
            </div>
          </div>
          
          
        </div>
        
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-white/70 text-sm text-center px-4">Scroll to explore</div>
        </div>
      </section>

      {/* Location Search Section */}
      <section className="py-12 md:py-20 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <LocationSearch />
        </div>
      </section>

      {/* Weekly Spotlight Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <WeeklySpotlight />
        </div>
      </section>

      {/* Margarita Game Section */}
      <section className="py-12 md:py-20 bg-gradient-electric border-y-8 border-black">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto card-brutal p-8 bg-white">
            <h2 className="text-4xl md:text-6xl font-black text-black mb-6 animate-glitch">
              🍹 MARGARITA CRUSH! 🎮
            </h2>
            <p className="text-lg md:text-xl text-black font-bold mb-8 leading-relaxed">
              CHALLENGE YOUR FRIENDS IN OUR ADDICTIVE MATCH-3 GAME! COLLECT MARGARITA GLASSES, SCORE POINTS, AND BECOME THE ULTIMATE MARGARITA MASTER.
            </p>
            <Button 
              variant="neon" 
              size="lg" 
              onClick={() => navigate('/margarita-game')}
            >
              🎯 START PLAYING NOW!
            </Button>
          </div>
        </div>
      </section>

      {/* Shell Game Section */}
      <section className="py-12 md:py-20 bg-gradient-cyber border-y-8 border-black">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto card-brutal p-8 bg-white">
            <h2 className="text-4xl md:text-6xl font-black text-black mb-6">
              🐚 SHELL GAME! 🍹
            </h2>
            <p className="text-lg md:text-xl text-black font-bold mb-8 leading-relaxed">
              CLASSIC CARNIVAL GAME! WATCH THE SHELLS SHUFFLE AND FIND THE HIDDEN MARGARITA. TEST YOUR FOCUS AND WIN!
            </p>
            <Button 
              variant="cyber" 
              size="lg" 
              onClick={() => navigate('/shell-game')}
            >
              🎯 START SHELL GAME!
            </Button>
          </div>
        </div>
      </section>

      {/* Drink Specials Section */}
      <section data-section="drink-specials" className="py-12 md:py-20 bg-muted/30">
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
            <Button variant="electric" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/party-central')}>
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
            <Button variant="cyber" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/rate-drink')}>
              <Star className="w-5 h-5" />
              Write a Review
            </Button>
          </div>
          
          <RecentReviews maxItems={6} />
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
              <Button variant="electric" size="lg" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? "HIDE FORM" : "ADD YOUR ESTABLISHMENT"}
              </Button>
              <Button variant="neon" size="lg" onClick={() => setShowManageForm(!showManageForm)}>
                {showManageForm ? "HIDE MANAGEMENT" : "MANAGE SPECIALS"}
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
      <section className="py-12 md:py-20 bg-gradient-sunset border-y-8 border-black">
        <div className="container mx-auto px-4 text-center">
          <div className="card-brutal p-8 bg-white max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-black mb-6 leading-tight animate-neon-pulse">
              READY TO FIND YOUR PERFECT MARGARITA? 🍹
            </h2>
            <p className="text-lg md:text-xl text-black font-bold mb-8 max-w-2xl mx-auto leading-relaxed">
              JOIN THOUSANDS OF MARGARITA ENTHUSIASTS DISCOVERING AMAZING DRINKS AND SHARING HONEST REVIEWS!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button variant="neon" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/rate-drink')}>
                START RATING
              </Button>
              <Button variant="electric" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/rate-drink')}>
                SHARE YOUR REVIEW
              </Button>
            </div>
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
