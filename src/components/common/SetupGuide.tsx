import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SetupGuideProps {
  onDismiss?: () => void;
}

export function SetupGuide({ onDismiss }: SetupGuideProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          First Time Setup Required
        </CardTitle>
        <CardDescription>
          Before generating your first roadmap, please complete the following setup steps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI Model API Keys Required</AlertTitle>
          <AlertDescription>
            The AI roadmap generation supports multiple providers. Configure at least one API key to get started. Free
            models are available with Gemini.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              1
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Choose Your AI Provider</p>
              <p className="text-sm text-muted-foreground">Select one or more providers to configure:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 space-y-1">
                <li>
                  <strong>Google Gemini</strong> - Has free tier (Gemini 1.5 Flash)
                </li>
                <li>
                  <strong>OpenAI</strong> - ChatGPT models (paid)
                </li>
                <li>
                  <strong>Anthropic Claude</strong> - Claude models (paid)
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              2
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Get API Keys</p>
              <div className="space-y-2">
                <div className="rounded-md bg-muted p-3 space-y-1">
                  <p className="text-sm font-medium">Google Gemini (Recommended - Has Free Tier)</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Get Gemini API Key
                    </a>
                  </Button>
                </div>
                <div className="rounded-md bg-muted p-3 space-y-1">
                  <p className="text-sm font-medium">OpenAI ChatGPT</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Get OpenAI API Key
                    </a>
                  </Button>
                </div>
                <div className="rounded-md bg-muted p-3 space-y-1">
                  <p className="text-sm font-medium">Anthropic Claude</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Get Claude API Key
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              3
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Add API Keys to Supabase</p>
              <p className="text-sm text-muted-foreground">
                Go to your Supabase Dashboard → Edge Functions → Secrets
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 space-y-1">
                <li>
                  For Gemini: Name: <code className="bg-muted px-1 py-0.5 rounded">GEMINI_API_KEY</code>
                </li>
                <li>
                  For OpenAI: Name: <code className="bg-muted px-1 py-0.5 rounded">LLM_API_KEY</code>
                </li>
                <li>
                  For Claude: Name: <code className="bg-muted px-1 py-0.5 rounded">CLAUDE_API_KEY</code>
                </li>
              </ul>
              <Button variant="outline" size="sm" asChild className="mt-2">
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Open Supabase Dashboard
                </a>
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              4
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Select model and generate roadmap</p>
              <p className="text-sm text-muted-foreground">
                Choose your preferred AI model from the dropdown and click "Generate Roadmap"
              </p>
            </div>
          </div>
        </div>

        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Need Help?</AlertTitle>
          <AlertDescription>
            For detailed troubleshooting, refer to the{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">EDGE_FUNCTION_DEBUG.md</code> file in the project
            root directory.
          </AlertDescription>
        </Alert>

        {onDismiss && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onDismiss}>
              I've completed the setup
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
