import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useProgress } from '@/contexts/ProgressContext';
import { Loader2, Clock, Target, BookOpen, Video, FileText, Code, ExternalLink, Info } from 'lucide-react';
import { formatDifficulty } from '@/lib/formatters';
import type { RoadmapStep, Resource } from '@/types';
import { getBrandColors } from '@/constants/companyBranding';
import { getCompanyImages } from '@/constants/companyImages';
import { getHiringStat } from '@/constants/companyHiringStats';

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

  const brandColors = useMemo(() => {
    return currentRoadmap ? getBrandColors(currentRoadmap.target_company) : null;
  }, [currentRoadmap]);

  const companyImages = useMemo(() => {
    return currentRoadmap ? getCompanyImages(currentRoadmap.target_company) : null;
  }, [currentRoadmap]);

  const hiringStat = useMemo(() => {
    return currentRoadmap ? getHiringStat(currentRoadmap.target_company) : null;
  }, [currentRoadmap]);

  const handleStepComplete = async (stepId: string, completed: boolean) => {
    if (roadmapId) {
      await updateProgress(roadmapId, stepId, completed);
    }
  };

  const isStepCompleted = (stepId: string) => {
    return progress?.completed_steps?.includes(stepId) ?? false;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':         return <Video    className="h-4 w-4" />;
      case 'practice':      return <Code     className="h-4 w-4" />;
      case 'documentation': return <FileText className="h-4 w-4" />;
      default:              return <BookOpen className="h-4 w-4" />;
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
      if (!acc[step.phase]) acc[step.phase] = [];
      acc[step.phase].push(step);
      return acc;
    },
    {} as Record<string, RoadmapStep[]>
  );

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      {/* Roadmap Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center p-3 shadow-lg"
            style={{ background: brandColors?.primary || '#0AFFE4' }}
          >
            <img 
              src={`https://www.google.com/s2/favicons?domain=${currentRoadmap.target_company.toLowerCase()}.com&sz=64`} 
              alt={currentRoadmap.target_company} 
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              {currentRoadmap.career_goal}
            </h1>
            <p className="text-xl text-muted-foreground mt-1">
              Your personalized path to joining <span style={{ color: brandColors?.primary }}>{currentRoadmap.target_company}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Badge 
            variant="outline" 
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full"
            style={{ borderColor: brandColors?.dark, background: brandColors?.light }}
          >
            <Target className="h-4 w-4" style={{ color: brandColors?.primary }} />
            {currentRoadmap.target_company}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-secondary">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {currentRoadmap.timeline}
          </Badge>
          {progress && (
            <Badge 
              className="px-4 py-1.5 text-sm rounded-full shadow-md"
              style={{ background: brandColors?.primary }}
            >
              Progress: {Math.round(progress.progress_percentage)}%
            </Badge>
          )}
        </div>

        {/* 3-Image Grid Layout */}
        {companyImages && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 h-[500px]">
            <div className="md:col-span-2 relative group overflow-hidden rounded-3xl">
              <img 
                src={companyImages.main.src} 
                alt={companyImages.main.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-end p-6">
                <span className="text-white font-medium self-end">{companyImages.main.alt}</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {companyImages.secondary.map((img, idx) => (
                <a 
                  key={idx} 
                  href={img.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 relative group overflow-hidden rounded-3xl block"
                >
                  <img 
                    src={img.src} 
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white/10 p-2 rounded-full border border-white/20">
                      <ExternalLink className="text-white h-5 w-5" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-white text-xs font-semibold px-2 py-1 rounded bg-black/50 backdrop-blur-md">
                      {img.alt}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Verified Narrative Stat */}
        {hiringStat && (
          <div 
            className="mb-10 p-6 rounded-3xl border flex gap-4 items-start"
            style={{ 
              borderColor: brandColors?.dark, 
              background: `linear-gradient(to right, ${brandColors?.light}, transparent)` 
            }}
          >
            <div 
              className="p-3 rounded-2xl shrink-0 shadow-sm"
              style={{ background: brandColors?.primary }}
            >
              <Info className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-medium leading-relaxed">
                {hiringStat.text}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Source:</span>
                <a 
                  href={hiringStat.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs hover:underline flex items-center gap-1"
                  style={{ color: brandColors?.primary }}
                >
                  {hiringStat.source}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {Object.entries(groupedSteps).map(([phase, steps]) => (
          <Card key={phase} className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div 
                  className="w-2 h-8 rounded-full" 
                  style={{ background: brandColors?.primary }}
                />
                {phase}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Accordion type="multiple" className="w-full space-y-4">
                {steps.map((step) => (
                  <AccordionItem 
                    key={step.id} 
                    value={step.id}
                    className="border rounded-3xl px-6 bg-card shadow-sm hover:shadow-md transition-shadow"
                    style={{ border: isStepCompleted(step.id) ? `1px solid ${brandColors?.primary}40` : undefined }}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={isStepCompleted(step.id)}
                        onCheckedChange={(checked) =>
                          handleStepComplete(step.id, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 w-6 rounded-lg data-[state=checked]:bg-primary"
                        style={{ 
                          borderColor: brandColors?.primary,
                          backgroundColor: isStepCompleted(step.id) ? brandColors?.primary : 'transparent'
                        }}
                        aria-label={`Mark "${step.title}" as ${isStepCompleted(step.id) ? 'incomplete' : 'complete'}`}
                      />

                      <AccordionTrigger className="hover:no-underline flex-1 py-6 text-left">
                        <div className="flex-1">
                          <div className={`text-lg font-bold ${isStepCompleted(step.id) ? 'line-through text-muted-foreground' : ''}`}>
                            {step.title}
                          </div>
                          <div className="flex gap-3 mt-2">
                            <Badge 
                              variant="secondary" 
                              className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md"
                            >
                              {formatDifficulty(step.difficulty)}
                            </Badge>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              {step.estimated_time}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                    </div>

                    <AccordionContent className="pb-8">
                      <div className="pl-10 space-y-6">
                        <p className="text-muted-foreground text-base leading-relaxed">
                          {step.description}
                        </p>

                        {step.resources && step.resources.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                              Curated Resources
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {step.resources.map((resource: Resource) => (
                                <div
                                  key={resource.id}
                                  className="group flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
                                >
                                  <div 
                                    className="mt-1 p-2 rounded-xl bg-background shadow-sm group-hover:scale-110 transition-transform"
                                    style={{ color: brandColors?.primary }}
                                  >
                                    {getResourceIcon(resource.resource_type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate">{resource.title}</div>
                                    {resource.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {resource.description}
                                      </p>
                                    )}
                                    {resource.url && (
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold mt-2 flex items-center gap-1 group-hover:underline"
                                        style={{ color: brandColors?.primary }}
                                      >
                                        Visit Resource
                                        <ExternalLink className="h-3 w-3" />
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