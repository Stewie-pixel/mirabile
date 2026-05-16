import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { Loader2, TrendingUp, Target, Flame, Award, ArrowRight } from 'lucide-react';
import type { Roadmap } from '@/types';

export default function DashboardPage() {
  const { fetchUserRoadmaps, loading } = useRoadmap();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    const loadRoadmaps = async () => {
      const data = await fetchUserRoadmaps();
      setRoadmaps(data);
      if (data.length > 0) {
        setActiveRoadmap(data[0]);
      }
    };
    loadRoadmaps();
  }, [fetchUserRoadmaps]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: '#0AFFE4' }} />
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="glass-strong rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Target className="h-16 w-16" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <h2 className="text-2xl font-semibold" style={{ color: '#ffffff' }}>No Roadmaps Yet</h2>
            <p className="text-center max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Start your career journey by generating your first personalized roadmap.
            </p>
            <Button asChild>
              <Link to="/generator">
                Generate Your First Roadmap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Track your progress and stay on top of your career goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-strong rounded-2xl p-5">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Active Roadmaps</span>
            <Target className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
          <div className="text-2xl font-bold text-gradient">{roadmaps.length}</div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Career paths in progress</p>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Current Streak</span>
            <Flame className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>0 days</div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Keep learning daily</p>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Milestones</span>
            <Award className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>0</div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Achievements unlocked</p>
        </div>
      </div>

      {activeRoadmap && (
        <div className="glass-strong rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-1" style={{ color: '#ffffff' }}>Current Roadmap</h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {activeRoadmap.career_goal} at{' '}
            <span className="text-gradient font-semibold">{activeRoadmap.target_company}</span>
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Overall Progress</span>
                <span className="font-medium" style={{ color: '#ffffff' }}>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="glass" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {activeRoadmap.timeline}
              </Badge>
              <Badge variant="outline" className="glass" style={{ color: 'rgba(255,255,255,0.7)' }}>
                0 steps completed
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link to={`/roadmap/${activeRoadmap.id}`}>
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="glass">
                <Link to="/progress">View Progress</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-strong rounded-2xl p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: '#ffffff' }}>
          <TrendingUp className="h-5 w-5" style={{ color: '#0AFFE4' }} />
          Recommended Next Steps
        </h3>
        <div className="space-y-3">
          {[
            { title: 'Complete your first roadmap step', desc: 'Start building momentum by completing your first task' },
            { title: 'Review learning resources', desc: 'Explore curated materials to strengthen your understanding' },
            { title: 'Set a daily learning goal', desc: 'Consistency is key to achieving your career goals' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl glass">
              <div className="h-2 w-2 rounded-full mt-2" style={{ background: '#0AFFE4' }} />
              <div className="flex-1">
                <p className="font-medium" style={{ color: '#ffffff' }}>{item.title}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}