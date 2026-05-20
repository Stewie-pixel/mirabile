import { CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SetupGuideProps {
  onDismiss?: () => void;
}

export function SetupGuide({ onDismiss }: SetupGuideProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 md:p-8 group transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/0 to-[#F472B6]/0 group-hover:from-[#00F0FF]/5 group-hover:to-[#F472B6]/5 transition-colors duration-500" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ring-1 ring-inset ring-[#00F0FF]/30" />
      
      <div className="relative z-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#ffffff' }}>
            <div className="p-2 rounded-xl shadow-sm" style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #F472B6 100%)' }}>
              <CheckCircle2 className="h-5 w-5 text-black" />
            </div>
            Two Ways to Get Started
          </h2>
          <p className="text-muted-foreground mt-2">Choose the option that works best for you</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold text-black text-xs" style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #F472B6 100%)' }}>
              1
            </div>
            <p className="text-base font-semibold text-white">Option 1: Use default Models</p>
          </div>
          <p className="text-sm text-muted-foreground pl-9 -mt-4">
            Select a model from the dropdown (GPT-4o, Claude Haiku 4.6, or Claude Sonnet 4.5). No configuration needed!
          </p>

          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold text-black text-xs" style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #F472B6 100%)' }}>
              2
            </div>
            <p className="text-base font-semibold text-white">Option 2: Use Your Own API Keys</p>
          </div>
          <div className="space-y-2 pl-9 -mt-4">
            <p className="text-sm text-muted-foreground">If you prefer to use your own API keys:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 space-y-1">
              <li><strong className="text-white/90">Google Gemini</strong> - Gemini 2.5 Flash/Pro (free tier available)</li>
              <li><strong className="text-white/90">OpenAI</strong> - ChatGPT models (paid)</li>
              <li><strong className="text-white/90">Anthropic Claude</strong> - Claude models (paid)</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold text-black text-[10px]" style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #F472B6 100%)' }}>
              2a
            </div>
            <p className="text-sm font-semibold text-white">Get API Keys (for Option 2 only)</p>
          </div>
          <div className="pl-9 -mt-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3 hover:border-[#00F0FF]/30 transition-colors">
                <p className="text-sm font-medium text-white">Google Gemini <span className="text-xs text-[#00F0FF] block mt-1">(Recommended)</span></p>
                <Button variant="outline" size="sm" asChild className="w-full bg-transparent border-[#00F0FF]/20 hover:bg-[#00F0FF]/10 hover:text-[#00F0FF] transition-colors">
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" /> Get API Key
                  </a>
                </Button>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3 hover:border-[#00F0FF]/30 transition-colors">
                <p className="text-sm font-medium text-white">OpenAI ChatGPT <span className="text-xs text-white/50 block mt-1">(Paid)</span></p>
                <Button variant="outline" size="sm" asChild className="w-full bg-transparent border-[#00F0FF]/20 hover:bg-[#00F0FF]/10 hover:text-[#00F0FF] transition-colors">
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" /> Get API Key
                  </a>
                </Button>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3 hover:border-[#00F0FF]/30 transition-colors">
                <p className="text-sm font-medium text-white">Anthropic Claude <span className="text-xs text-white/50 block mt-1">(Paid)</span></p>
                <Button variant="outline" size="sm" asChild className="w-full bg-transparent border-[#00F0FF]/20 hover:bg-[#00F0FF]/10 hover:text-[#00F0FF] transition-colors">
                  <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" /> Get API Key
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold text-black text-[10px]" style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #F472B6 100%)' }}>
              2b
            </div>
            <p className="text-sm font-semibold text-white">Add API Keys to Supabase (for Option 2 only)</p>
          </div>
          <div className="space-y-2 pl-9 -mt-4">
            <p className="text-sm text-muted-foreground">
              Go to your Supabase Dashboard → Edge Functions → Secrets
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-20">Gemini:</span> <code className="bg-white/10 text-[#00F0FF] px-2 py-1 rounded border border-[#00F0FF]/20 text-xs">GEMINI_API_KEY</code>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-20">OpenAI:</span> <code className="bg-white/10 text-[#00F0FF] px-2 py-1 rounded border border-[#00F0FF]/20 text-xs">LLM_API_KEY</code>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-20">Claude:</span> <code className="bg-white/10 text-[#00F0FF] px-2 py-1 rounded border border-[#00F0FF]/20 text-xs">CLAUDE_API_KEY</code>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="mt-4 bg-transparent border-[#00F0FF]/20 hover:bg-[#00F0FF]/10 hover:text-[#00F0FF] transition-colors">
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-3 w-3" /> Open Supabase Dashboard
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold text-black text-xs" style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #F472B6 100%)' }}>
              3
            </div>
            <p className="text-base font-semibold text-white">Generate your roadmap!</p>
          </div>
          <p className="text-sm text-muted-foreground pl-9 -mt-4">
            Choose your preferred AI model from the dropdown and click "Generate Roadmap". Puter.js models work instantly, no setup required!
          </p>
        </div>

        <div className="mt-8 rounded-2xl p-4 flex gap-4 items-start" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="p-2 rounded-xl shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #F472B6 100%)' }}>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Need Help?</p>
            <p className="text-sm text-muted-foreground mt-1">
              For detailed troubleshooting, refer to the <code className="bg-white/10 text-[#00F0FF] px-2 py-0.5 rounded border border-[#00F0FF]/20 text-xs">README.md</code> file in the project root directory.
            </p>
          </div>
        </div>

        {onDismiss && (
          <div className="flex justify-end mt-6">
            <Button className="bg-gradient-to-r from-[#00F0FF] to-[#F472B6] text-black hover:opacity-90 font-semibold" size="sm" onClick={onDismiss}>
              I've completed the setup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
