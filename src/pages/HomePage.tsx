import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Target, TrendingUp, Award } from 'lucide-react';
import { useAuth } from 'miaoda-auth-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <section className="relative flex items-center justify-center py-20 md:py-32 px-4 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <img
              src="https://miaoda-conversation-file.s3cdn.medo.dev/user-b9n50z51dudc/20260428/file-b9ree3en0074.png"
              alt="Mirabile"
              className="h-24 md:h-32"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-4xl">
              Your AI-Powered Career Roadmap to Top Tech Companies
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Generate personalized career roadmaps, access curated resources, and track your progress toward landing
              your dream job at Google, Meta, Amazon, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {user ? (
                <>
                  <Button size="lg" asChild>
                    <Link to="/generator">
                      Generate Your Roadmap
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/dashboard">View Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Mirabile?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">AI-Powered Roadmaps</h3>
                  <p className="text-muted-foreground">
                    Get personalized career roadmaps tailored to your target company and timeline, powered by advanced
                    AI.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Curated Resources</h3>
                  <p className="text-muted-foreground">
                    Access high-quality learning materials, practice problems, and company-specific interview prep.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Progress Tracking</h3>
                  <p className="text-muted-foreground">
                    Track your progress, maintain streaks, and achieve milestones on your journey to success.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of professionals who have successfully landed their dream jobs with Mirabile.
          </p>
          {user ? (
            <Button size="lg" asChild>
              <Link to="/generator">
                Create Your Roadmap
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link to="/register">
                Sign Up Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}