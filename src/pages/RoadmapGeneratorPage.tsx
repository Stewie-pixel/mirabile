import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { roadmapGenerationSchema, type RoadmapGenerationInput } from '@/lib/validators';
import { COMPANIES } from '@/constants/companies';
import { TIMELINE_OPTIONS } from '@/constants/timelines';
import { CAREER_PATHS } from '@/constants/careerPaths';
import { AI_MODELS, FREE_MODELS, PAID_MODELS } from '@/constants/aiModels';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { SetupGuide } from '@/components/common/SetupGuide';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

export default function RoadmapGeneratorPage() {
  const navigate = useNavigate();
  const { generateRoadmap, loading, error: contextError } = useRoadmap();
  const [generatedRoadmapId, setGeneratedRoadmapId] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(true);

  const form = useForm<RoadmapGenerationInput>({
    resolver: zodResolver(roadmapGenerationSchema),
    defaultValues: {
      career_goal: '',
      target_company: '',
      timeline: '',
      ai_model: 'gemini-1.5-flash', // Default to free model
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
        description: 'Please check the console for more details or refer to EDGE_FUNCTION_DEBUG.md',
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Generate Your Career Roadmap</h1>
        <p className="text-muted-foreground">
          Tell us about your career goals, and our AI will create a personalized roadmap for you.
        </p>
      </div>

      {showSetupGuide && (
        <div className="mb-6">
          <SetupGuide onDismiss={() => setShowSetupGuide(false)} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Roadmap Generation
          </CardTitle>
          <CardDescription>Fill in the details below to generate your personalized career roadmap</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="career_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Target Company</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Timeline</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>AI Model</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Free Models</div>
                        {FREE_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                Free
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                          Paid Models
                        </div>
                        {PAID_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Paid
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      {field.value && AI_MODELS.find((m) => m.id === field.value)?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Roadmap
                    </>
                  )}
                </Button>
                {generatedRoadmapId && (
                  <Button type="button" variant="outline" onClick={handleViewRoadmap}>
                    View Roadmap
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <Card className="mt-6">
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
        <Card className="mt-6 border-destructive">
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
                  <li>If the issue persists, refer to EDGE_FUNCTION_DEBUG.md in the project root</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}