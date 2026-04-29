import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from 'miaoda-auth-react';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { Loader2, User, Mail, Calendar, Target } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import type { Roadmap } from '@/types';

export default function ProfilePage() {
  const { user } = useAuth();
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

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Joined {user?.created_at ? formatDate(user.created_at) : 'Recently'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Active Roadmaps
            </CardTitle>
            <CardDescription>Your current career paths</CardDescription>
          </CardHeader>
          <CardContent>
            {roadmaps.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active roadmaps</p>
            ) : (
              <div className="space-y-3">
                {roadmaps.map((roadmap) => (
                  <div key={roadmap.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{roadmap.career_goal}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{roadmap.target_company}</p>
                      </div>
                      <Badge variant="outline">{roadmap.timeline}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Created {formatDate(roadmap.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Your learning milestones and badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No achievements yet. Complete roadmap steps to unlock badges!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}