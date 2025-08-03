import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface VisitorStats {
  total_visits: number;
  unique_visitors: number;
  today_visits: number;
}

const VisitorCounter = () => {
  const [stats, setStats] = useState<VisitorStats>({
    total_visits: 0,
    unique_visitors: 0,
    today_visits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get visitor ID from localStorage or create new one
        let visitorId = localStorage.getItem('margarita_visitor_id');
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem('margarita_visitor_id', visitorId);
        }

        // Track this visit
        const { error: insertError } = await supabase
          .from('site_visits')
          .insert({
            visitor_id: visitorId,
            page: '/',
            timestamp: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error tracking visit:', insertError);
        }

        // Get stats
        await fetchStats();
      } catch (error) {
        console.error('Error in trackVisit:', error);
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        // Get total visits
        const { count: totalVisits } = await supabase
          .from('site_visits')
          .select('*', { count: 'exact', head: true });

        // Get unique visitors
        const { data: uniqueData } = await supabase
          .from('site_visits')
          .select('visitor_id');
        
        const uniqueVisitors = new Set(uniqueData?.map(v => v.visitor_id) || []).size;

        // Get today's visits
        const today = new Date().toISOString().split('T')[0];
        const { count: todayVisits } = await supabase
          .from('site_visits')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp', `${today}T00:00:00`);

        setStats({
          total_visits: totalVisits || 0,
          unique_visitors: uniqueVisitors,
          today_visits: todayVisits || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    trackVisit();
  }, []);

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Loading stats...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-lime transition-all duration-300">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Eye className="w-5 h-5 text-primary mb-1" />
            <div className="text-xl font-bold text-primary">{stats.total_visits.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Visits</div>
          </div>
          
          <div className="flex flex-col items-center">
            <TrendingUp className="w-5 h-5 text-secondary mb-1" />
            <div className="text-xl font-bold text-secondary">{stats.unique_visitors.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Unique Visitors</div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1">🔥</span>
            <div className="text-xl font-bold text-accent">{stats.today_visits.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorCounter;