import { useState, useEffect, useRef } from 'react';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useAuth } from '@/contexts/AuthContext';
import { puterService } from '@/services/puterService';
import { AI_MODELS, getModelById } from '@/constants/aiModels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Loader2, Bot, Info } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { currentRoadmap, roadmapSteps } = useRoadmap();
  const { profile } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('puter-gpt-4o');
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const modelConfig = getModelById(selectedModel);
      if (!modelConfig) throw new Error('Invalid model selected');

      // Build context from roadmap
      let contextPrompt = '';
      if (currentRoadmap) {
        contextPrompt = `
CURRENT ROADMAP CONTEXT:
Goal: ${currentRoadmap.career_goal}
Company: ${currentRoadmap.target_company}
Timeline: ${currentRoadmap.timeline}

Steps:
${roadmapSteps.map((s, i) => `${i + 1}. ${s.title} (${s.difficulty}): ${s.description}`).join('\n')}
`;
      }

      const systemPrompt = `You are a helpful career advisor AI for the Mirabile platform. 
Your goal is to help users with their career goals, answer questions about their roadmap, and suggest resources.
Be encouraging, professional, and specific.

${contextPrompt}

Answer the user's questions based on this context if applicable. If no roadmap exists, encourage them to generate one, but still answer their career-related questions.
`;

      // Build history for API call
      // Note: puterService.chat currently takes a single prompt. 
      // For multi-turn, we concatenate history into the prompt for now.
      const fullPrompt = `
System: ${systemPrompt}

History:
${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

User: ${input}
Assistant:`;

      const response = await puterService.chat(fullPrompt, {
        model: modelConfig.modelId as any,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen" style={{ background: 'transparent' }}>
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 sm:px-6 py-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-20 w-20 flex items-center justify-center mb-4">
                <img src="/images/logo.png" className="w-full h-full object-contain" alt="AI" />
              </div>
              <h2 className="text-2xl font-bold text-white">Hello! I'm your career assistant.</h2>
              <p className="text-white/70 max-w-sm">
                Ask me anything about your roadmap, interview prep, or career advice.
              </p>
              {!currentRoadmap && (
                <div className="max-w-md mt-6 relative overflow-hidden rounded-2xl p-6 group transition-all duration-300"
                  style={{ background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0AFFE4]/0 to-[#0EA5E9]/0 group-hover:from-[#0AFFE4]/5 group-hover:to-[#0EA5E9]/5 transition-colors duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ring-1 ring-inset ring-[#0AFFE4]/30" />
                  <div className="relative z-10 flex gap-3 text-left">
                    <Info className="h-5 w-5 text-[#0AFFE4] shrink-0" />
                    <p className="text-sm text-white/90 leading-relaxed">
                      <strong className="text-[#0AFFE4]">Tip:</strong> Generate a roadmap first so I can provide more personalized advice based on your goals.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                {message.role === 'user' ? (
                  <>
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-white/10 text-[#0AFFE4]">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="/images/logo.png" className="object-contain" />
                    <AvatarFallback className="bg-transparent">
                      <Bot className="h-4 w-4 text-[#0AFFE4]" />
                    </AvatarFallback>
                  </>
                )}
              </Avatar>

              <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : ''}`}>
                <div
                  className={`rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${message.role === 'user'
                      ? 'text-black rounded-tr-none font-medium'
                      : 'text-white/90 rounded-tl-none border border-white/10'
                    }`}
                  style={{
                    background: message.role === 'user' ? 'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)' : 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: message.role !== 'user' ? 'blur(12px)' : 'none'
                  }}
                >
                  {message.content}
                </div>
                <span className="text-[10px] text-white/40 mt-1 px-1 font-medium">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="/images/logo.png" className="object-contain" />
                <AvatarFallback className="bg-transparent">
                  <Bot className="h-4 w-4 text-[#0AFFE4]" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-tl-none px-3 py-2 border border-white/10 flex items-center justify-center"
                style={{ background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(12px)' }}>
                <Loader2 className="h-4 w-4 animate-spin text-[#0AFFE4]" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 sm:p-6 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          <div className="flex gap-2 items-end">
            <div className="relative flex-1">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-auto min-w-[120px] bg-transparent border-none shadow-none focus:ring-0 text-xs text-white">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-xs">
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Message your assistant..."
                className="pl-[140px] h-12 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-1 focus-visible:ring-[#0AFFE4]/50 text-white placeholder:text-white/40 transition-shadow"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
            </div>
            <Button
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0 text-black border-none hover:opacity-90 shadow-lg shadow-[#0AFFE4]/20 transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)' }}
              disabled={!input.trim() || isLoading}
              onClick={handleSend}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-white/40 font-medium">
            AI can make mistakes. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
