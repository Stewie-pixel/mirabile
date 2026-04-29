import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useProgress } from '@/contexts/ProgressContext';
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Target className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">No Roadmaps Yet</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Start your career journey by generating your first personalized roadmap.
              </p>
              <Button asChild>
                <Link to="/generator">
                  Generate Your First Roadmap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and stay on top of your career goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roadmaps</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roadmaps.length}</div>
            <p className="text-xs text-muted-foreground">Career paths in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 days</div>
            <p className="text-xs text-muted-foreground">Keep learning daily</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Milestones</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Achievements unlocked</p>
          </CardContent>
        </Card>
      </div>

      {activeRoadmap && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Roadmap</CardTitle>
            <CardDescription>
              {activeRoadmap.career_goal} at {activeRoadmap.target_company}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{activeRoadmap.timeline}</Badge>
              <Badge variant="outline">0 steps completed</Badge>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link to={`/roadmap/${activeRoadmap.id}`}>
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/progress">View Progress</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="font-medium">Complete your first roadmap step</p>
                <p className="text-sm text-muted-foreground">Start building momentum by completing your first task</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="font-medium">Review learning resources</p>
                <p className="text-sm text-muted-foreground">
                  Explore curated materials to strengthen your understanding
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="font-medium">Set a daily learning goal</p>
                <p className="text-sm text-muted-foreground">Consistency is key to achieving your career goals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}