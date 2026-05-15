import { SetupGuide } from '@/components/common/SetupGuide';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function InstructionsPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Model Instructions</h1>
          <p className="text-muted-foreground">Learn how to use and configure different AI models</p>
        </div>
      </div>

      <div className="space-y-8">
        <SetupGuide />
      </div>
    </div>
  );
}