import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useProgress } from '@/contexts/ProgressContext';
import {
  Loader2, Clock, Target, BookOpen, Video, FileText, Code,
  ExternalLink, Info, Layers, TrendingUp, Rocket, Crown, Star, Zap,
  Computer,
} from 'lucide-react';
import { formatDifficulty } from '@/lib/formatters';
import type { RoadmapStep, Resource } from '@/types';
import { getCompanyImages } from '@/constants/companyImages';
import { getHiringStat } from '@/constants/companyHiringStats';

/* ── Company icon from /public/icons/ ── */
const COMPANY_ICONS: Record<string, string> = {
  google: '/icons/google.png',
  microsoft: '/icons/microsoft.png',
  meta: '/icons/meta.png',
  amazon: '/icons/amazon.png',
  apple: '/icons/apple.png',
  nvidia: '/icons/nvidia.png',
  adobe: '/icons/adobe.png',
  ibm: '/icons/ibm.png',
  linkedin: '/icons/linkedin.png',
  openai: '/icons/openai.png',
  pinterest: '/icons/pinterest.png',
  stripe: '/icons/stripe.png',
};

function getCompanyIcon(companyName: string): string {
  const id = companyName.toLowerCase().replace(/\s+/g, '');
  return COMPANY_ICONS[id] ?? `/icons/${id}.png`;
}

/* ── Phase config: color + icon ── */
const PHASE_CONFIGS: Record<string, { color: string; icon: React.ElementType }> = {
  foundation: { color: '#22c55e', icon: Layers },
  intermediate: { color: '#3b82f6', icon: TrendingUp },
  advanced: { color: '#a855f7', icon: Rocket },
  expert: { color: '#ef4444', icon: Crown },
  mastery: { color: '#f59e0b', icon: Star },
  specialization: { color: '#ec4899', icon: Zap },
  interview: { color: '#eab308', icon: Computer },
};

function getPhaseConfig(phaseName: string) {
  const key = phaseName.toLowerCase().replace(/[^a-z]/g, '');
  for (const [k, v] of Object.entries(PHASE_CONFIGS)) {
    if (key.includes(k)) return v;
  }
  return { color: '#0AFFE4', icon: Layers };
}

/* ── GlassCard wrapper component ── */
function GlassCard({
  children, className = '', style, borderColor, onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  borderColor?: string;
  onClick?: () => void;
}) {

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        border: `1px solid ${borderColor || 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default function RoadmapViewerPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const { currentRoadmap, roadmapSteps, loading, fetchRoadmap } = useRoadmap();
  const { progress, fetchProgress, updateProgress } = useProgress();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (roadmapId) {
      fetchRoadmap(roadmapId);
      fetchProgress(roadmapId);
    }
  }, [roadmapId, fetchRoadmap, fetchProgress]);

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

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'practice': return <Code className="h-4 w-4" />;
      case 'documentation': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: '#0AFFE4' }} />
      </div>
    );
  }

  if (!currentRoadmap) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <GlassCard className="p-8">
          <p className="text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>Roadmap not found</p>
        </GlassCard>
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

  const phases = Object.entries(groupedSteps);

  return (
    <div className="container mx-auto max-w-[736px] py-8 px-4">
      {/* ═══ Roadmap Header ═══ */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center p-2 shadow-lg glass-strong">
            <img
              src={getCompanyIcon(currentRoadmap.target_company)}
              alt={currentRoadmap.target_company}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: '#ffffff' }}>
              {currentRoadmap.career_goal}
            </h1>
            <p className="text-xl mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Your personalized path to joining{' '}
              <span className="text-gradient font-semibold">{currentRoadmap.target_company}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full glass"
            style={{ color: '#ffffff' }}
          >
            <Target className="h-4 w-4" style={{ color: '#0AFFE4' }} />
            {currentRoadmap.target_company}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full glass"
            style={{ color: '#ffffff' }}
          >
            <Clock className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
            {currentRoadmap.timeline}
          </Badge>
          {progress && (
            <Badge
              className="px-4 py-1.5 text-sm rounded-full shadow-md font-semibold"
              style={{ background: 'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)', color: '#000' }}
            >
              Progress: {Math.round(progress.progress_percentage)}%
            </Badge>
          )}
        </div>

        {/* ═══ 3-Image Grid: 500x300 main, 220x150 secondary ═══ */}
        {companyImages && (
          <div className="flex justify-center mb-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-[475px_220px] gap-4">
              <div className="relative group overflow-hidden rounded-2xl w-full max-w-[500px]" style={{ width: '475px', height: '320px' }}>
                <img
                  src={companyImages.main.src}
                  alt={companyImages.main.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-end p-5">
                  <span className="text-white font-medium self-end text-sm">{companyImages.main.alt}</span>
                </div>
              </div>
              <div className="grid grid-rows-2 gap-4 justify-center md:justify-start">
                {companyImages.secondary.map((img, idx) => (
                  <a
                    key={idx}
                    href={img.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group overflow-hidden rounded-2xl block w-full max-w-[220px]"
                    style={{ height: '150px' }}
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
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-white text-xs font-semibold px-2 py-1 rounded bg-black/50 backdrop-blur-md">
                        {img.alt}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Hiring Stat ═══ */}
        {hiringStat && (
          <GlassCard className="mb-10 p-4 flex gap-4 items-start">
            <div
              className="p-2 rounded-xl shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)' }}
            >
              <Info className="h-5 w-6 text-black" />
            </div>
            <div>
              <p className="mt-3 text-lg font-medium leading-relaxed" style={{ color: '#ffffff' }}>
                {hiringStat.text}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Source:
                </span>
                <a
                  href={hiringStat.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline flex items-center gap-1"
                  style={{ color: '#0AFFE4' }}
                >
                  {hiringStat.source}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* ═══ Phase Cards Grid (3 per row) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {phases.map(([phase, steps]) => {
          const config = getPhaseConfig(phase);
          const PhaseIcon = config.icon;
          const completedCount = steps.filter(s => isStepCompleted(s.id)).length;
          const isExpanded = expandedPhase === phase;

          return (
            <GlassCard
              key={phase}
              borderColor={isExpanded ? config.color : `${config.color}40`}
              className={`p-5 ${isExpanded ? 'ring-1 ring-current' : ''}`}
              style={{
                boxShadow: isExpanded ? `0 0 25px ${config.color}15` : undefined,
              }}
              onClick={() => setExpandedPhase(isExpanded ? null : phase)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${config.color}20`, border: `1px solid ${config.color}40` }}
                >
                  <PhaseIcon size={20} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold truncate" style={{ color: '#ffffff' }}>
                    {phase}
                  </h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {steps.length} steps · {completedCount} done
                  </p>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${steps.length > 0 ? (completedCount / steps.length) * 100 : 0}%`,
                    background: config.color,
                  }}
                />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ═══ Expanded Phase Steps ═══ */}
      {expandedPhase && groupedSteps[expandedPhase] && (() => {
        const config = getPhaseConfig(expandedPhase);
        const steps = groupedSteps[expandedPhase];

        return (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-2 h-8 rounded-full"
                style={{ background: config.color }}
              />
              <h2 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                {expandedPhase}
              </h2>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {steps.length} steps
              </span>
            </div>

            <div className="space-y-3">
              {steps.map(step => {
                const isExpanded = expandedSteps.has(step.id);
                const completed = isStepCompleted(step.id);

                return (
                  <GlassCard
                    key={step.id}
                    borderColor={completed ? `${config.color}60` : undefined}
                    className="overflow-visible"
                  >
                    {/* Step header — clickable */}
                    <div
                      className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                      onClick={() => toggleStep(step.id)}
                    >
                      <Checkbox
                        checked={completed}
                        onCheckedChange={(checked) =>
                          handleStepComplete(step.id, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5 rounded-lg data-[state=checked]:bg-primary flex-shrink-0"
                        style={{
                          borderColor: config.color,
                          backgroundColor: completed ? config.color : 'transparent',
                        }}
                        aria-label={`Mark "${step.title}" as ${completed ? 'incomplete' : 'complete'}`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className={`text-base font-bold ${completed ? 'line-through' : ''}`}
                          style={{ color: completed ? 'rgba(255,255,255,0.4)' : '#ffffff' }}>
                          {step.title}
                        </div>
                        <div className="flex gap-3 mt-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md glass"
                            style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)' }}
                          >
                            {formatDifficulty(step.difficulty)}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: 'rgba(255,255,255,0.4)' }}>
                            <Clock className="h-3.5 w-3.5" />
                            {step.estimated_time}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded step content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 space-y-5"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-sm leading-relaxed pl-9" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {step.description}
                        </p>

                        {step.resources && step.resources.length > 0 && (
                          <div className="space-y-3 pl-9">
                            <h4 className="font-bold text-xs uppercase tracking-widest"
                              style={{ color: 'rgba(255,255,255,0.35)' }}>
                              Curated Resources
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {step.resources.map((resource: Resource) => (
                                <div
                                  key={resource.id}
                                  className="group flex items-start gap-3 p-3 rounded-xl glass"
                                >
                                  <div
                                    className="mt-0.5 p-1.5 rounded-lg group-hover transition-transform"
                                    style={{ color: config.color, background: `${config.color}15` }}
                                  >
                                    {getResourceIcon(resource.resource_type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate" style={{ color: '#ffffff' }}>
                                      {resource.title}
                                    </div>
                                    {resource.description && (
                                      <p className="text-xs mt-1 line-clamp-2"
                                        style={{ color: 'rgba(255,255,255,0.4)' }}>
                                        {resource.description}
                                      </p>
                                    )}
                                    {resource.url && (
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold mt-1.5 flex items-center gap-1 hover:underline"
                                        style={{ color: '#0AFFE4' }}
                                        onClick={(e) => e.stopPropagation()}
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
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}