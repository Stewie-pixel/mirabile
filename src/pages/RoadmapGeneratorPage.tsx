import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { roadmapGenerationSchema, type RoadmapGenerationInput } from '@/lib/validators';
import { COMPANIES } from '@/constants/companies';
import { TIMELINE_OPTIONS } from '@/constants/timelines';
import { CAREER_PATHS } from '@/constants/careerPaths';
import { AI_MODELS, PUTER_MODELS, API_KEY_MODELS } from '@/constants/aiModels';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

export default function RoadmapGeneratorPage() {
  const navigate = useNavigate();
  const { generateRoadmap, loading, error: contextError } = useRoadmap();
  const [generatedRoadmapId, setGeneratedRoadmapId] = useState<string | null>(null);

  const form = useForm<RoadmapGenerationInput>({
    resolver: zodResolver(roadmapGenerationSchema),
    defaultValues: {
      career_goal: '',
      target_company: '',
      timeline: '',
      ai_model: 'puter-gpt-4o', 
    },
  });

  const onSubmit = async (values: RoadmapGenerationInput) => {
    try {
      const roadmap = await generateRoadmap(
        values.career_goal,
        values.target_company,
        values.timeline,
        values.ai_model
      );

      if (roadmap) {
        setGeneratedRoadmapId(roadmap.id);
        toast.success('Roadmap generated successfully!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate roadmap';
      console.error('Roadmap generation error:', errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Please check the console for more details or refer to README.md',
      });
    }
  };

  const handleViewRoadmap = () => {
    if (generatedRoadmapId) {
      navigate(`/roadmap/${generatedRoadmapId}`);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>
          Generate Your <span className="text-gradient">Career Roadmap</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>
          Tell us about your career goals, and our AI will create a personalized roadmap for you.
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <Link 
          to="/instructions" 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-primary/80 hover:text-white"
          style={{ background: 'rgba(10, 255, 226, 0.5)', color: '#ffffff', border: '1px solid rgba(10,255,228,0.2)' }}
        >
          Read model usage instructions here →
        </Link>
      </div>

      <Card className="glass-strong rounded-2xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Sparkles className="h-5 w-5" style={{ color: '#0AFFE4' }} />
            AI-Powered Roadmap Generation
          </CardTitle>
          <CardDescription style={{ color: 'rgba(255,255,255,0.5)' }}>Fill in the details below to generate your personalized career roadmap</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="career_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: '#0AFFE4' }}>Career Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger style={{ color: '#ffffff' }}>
                          <SelectValue placeholder="Select your career goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAREER_PATHS.map((path) => (
                          <SelectItem key={path.id} value={path.name}>
                            {path.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: '#0AFFE4' }}>Target Company</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger style={{ color: '#ffffff' }}>
                          <SelectValue placeholder="Select your target company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMPANIES.map((company) => (
                          <SelectItem key={company.id} value={company.name}>
                            <div className="flex items-center gap-2">
                              {company.logo && <img src={company.logo} alt={company.name} className="h-4 w-4" />}
                              {company.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: '#0AFFE4' }}>Timeline</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger style={{ color: '#ffffff' }}>
                          <SelectValue placeholder="Select your timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMELINE_OPTIONS.map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ai_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: '#0AFFE4' }}>AI Model</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger style={{ color: '#ffffff' }}>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          No Setup Required
                        </div>
                        {PUTER_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                          Requires API Key Setup
                        </div>
                        {API_KEY_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              {model.isFree}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {AI_MODELS.find((m) => m.id === field.value)?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center pt-2">
                <Button variant="gradient" size="sm" type="submit" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="h-3.5 w-3.5" />Generate Roadmap</>
                  )}
                </Button>
              
                {generatedRoadmapId && (
                  <Button variant="outline" size="sm" type="button" onClick={handleViewRoadmap} className="ml-3">
                    View Roadmap
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <Card className="mt-6 glass-strong rounded-2xl border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Generating your personalized roadmap...</p>
              <p className="text-sm text-muted-foreground">This may take 10-30 seconds</p>
            </div>
          </CardContent>
        </Card>
      )}

      {contextError && !loading && (
        <Card className="mt-6 border-destructive glass-strong rounded-2xl">
          <CardHeader>
            <CardTitle className="text-destructive">Error Generating Roadmap</CardTitle>
            <CardDescription>Please check the details below and try again</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">{contextError}</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Common solutions:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Ensure you have configured the LLM_API_KEY in Supabase Dashboard → Edge Functions → Secrets</li>
                  <li>Verify your OpenAI API key is valid and has sufficient credits</li>
                  <li>Check your internet connection and try again</li>
                  <li>If the issue persists, refer to README.md in the project root</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
