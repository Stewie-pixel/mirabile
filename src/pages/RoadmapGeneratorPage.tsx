import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { roadmapGenerationSchema, type RoadmapGenerationInput } from '@/lib/validators';
import { COMPANIES } from '@/constants/companies';
import { TIMELINE_OPTIONS } from '@/constants/timelines';
import { CAREER_PATHS } from '@/constants/careerPaths';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

export default function RoadmapGeneratorPage() {
  const navigate = useNavigate();
  const { generateRoadmap, loading } = useRoadmap();
  const [generatedRoadmapId, setGeneratedRoadmapId] = useState<string | null>(null);

  const form = useForm<RoadmapGenerationInput>({
    resolver: zodResolver(roadmapGenerationSchema),
    defaultValues: {
      career_goal: '',
      target_company: '',
      timeline: '',
    },
  });

  const onSubmit = async (values: RoadmapGenerationInput) => {
    try {
      const roadmap = await generateRoadmap(values.career_goal, values.target_company, values.timeline);

      if (roadmap) {
        setGeneratedRoadmapId(roadmap.id);
        toast.success('Roadmap generated successfully!');
      } else {
        toast.error('Failed to generate roadmap');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate roadmap');
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
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}