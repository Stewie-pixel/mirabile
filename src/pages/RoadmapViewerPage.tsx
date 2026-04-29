import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useProgress } from '@/contexts/ProgressContext';
import { Loader2, Clock, Target, BookOpen, Video, FileText, Code } from 'lucide-react';
import { formatDifficulty } from '@/lib/formatters';
import type { RoadmapStep, Resource } from '@/types';

export default function RoadmapViewerPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const { currentRoadmap, roadmapSteps, loading, fetchRoadmap } = useRoadmap();
  const { progress, fetchProgress, updateProgress } = useProgress();

  useEffect(() => {
    if (roadmapId) {
      fetchRoadmap(roadmapId);
      fetchProgress(roadmapId);
    }
  }, [roadmapId, fetchRoadmap, fetchProgress]);

  const handleStepComplete = async (stepId: string, completed: boolean) => {
    if (roadmapId) {
      await updateProgress(roadmapId, stepId, completed);
    }
  };

  const isStepCompleted = (stepId: string) => {
    return progress?.completed_steps?.includes(stepId) || false;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'practice':
        return <Code className="h-4 w-4" />;
      case 'documentation':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentRoadmap) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Roadmap not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedSteps = roadmapSteps.reduce(
    (acc, step) => {
      if (!acc[step.phase]) {
        acc[step.phase] = [];
      }
      acc[step.phase].push(step);
      return acc;
    },
    {} as Record<string, RoadmapStep[]>
  );

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{currentRoadmap.career_goal} Roadmap</h1>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {currentRoadmap.target_company}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {currentRoadmap.timeline}
          </Badge>
          {progress && (
            <Badge className="bg-primary">
              Progress: {Math.round(progress.progress_percentage)}%
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedSteps).map(([phase, steps]) => (
          <Card key={phase}>
            <CardHeader>
              <CardTitle className="text-xl">{phase}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {steps.map((step, index) => (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <Checkbox
                          checked={isStepCompleted(step.id)}
                          onCheckedChange={(checked) => handleStepComplete(step.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{step.title}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {formatDifficulty(step.difficulty)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {step.estimated_time}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-9 space-y-4">
                        <p className="text-muted-foreground">{step.description}</p>

                        {step.resources && step.resources.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Resources</h4>
                            <div className="space-y-2">
                              {step.resources.map((resource: Resource) => (
                                <div key={resource.id} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                                  <div className="mt-0.5 text-primary">{getResourceIcon(resource.resource_type)}</div>
                                  <div className="flex-1">
                                    <div className="font-medium">{resource.title}</div>
                                    {resource.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                                    )}
                                    {resource.url && (
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline mt-1 inline-block"
                                      >
                                        View Resource →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}