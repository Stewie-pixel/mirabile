import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useProgress } from '@/contexts/ProgressContext';
import { Loader2, Flame, Award, CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import type { Roadmap } from '@/types';

export default function ProgressTrackingPage() {
  const { fetchUserRoadmaps, loading } = useRoadmap();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);

  useEffect(() => {
    const loadRoadmaps = async () => {
      const data = await fetchUserRoadmaps();
      setRoadmaps(data);
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

  const milestones = [
    { name: 'First Step', percentage: 25, achieved: false },
    { name: 'Halfway There', percentage: 50, achieved: false },
    { name: 'Almost Done', percentage: 75, achieved: false },
    { name: 'Completed', percentage: 100, achieved: false },
  ];

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Progress Tracking</h1>
        <p className="text-muted-foreground">Monitor your learning journey and celebrate your achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <Progress value={0} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">0 of 0 steps completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 days</div>
            <p className="text-xs text-muted-foreground mt-2">Keep the momentum going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Milestones</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 / 4</div>
            <p className="text-xs text-muted-foreground mt-2">Achievements unlocked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>Track your major achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.name} className="flex items-center gap-3">
                  {milestone.achieved ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={milestone.achieved ? 'font-medium' : 'text-muted-foreground'}>
                        {milestone.name}
                      </span>
                      <Badge variant={milestone.achieved ? 'default' : 'outline'}>{milestone.percentage}%</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Roadmaps</CardTitle>
            <CardDescription>Your current learning paths</CardDescription>
          </CardHeader>
          <CardContent>
            {roadmaps.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active roadmaps</p>
            ) : (
              <div className="space-y-4">
                {roadmaps.map((roadmap) => (
                  <div key={roadmap.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{roadmap.career_goal}</h3>
                        <p className="text-sm text-muted-foreground">{roadmap.target_company}</p>
                      </div>
                      <Badge variant="outline">{roadmap.timeline}</Badge>
                    </div>
                    <Progress value={0} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">0% complete</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity yet. Start completing tasks to see your progress here!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}