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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Sparkles, User, Loader2, Bot, Info, MessageSquare } from 'lucide-react';

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
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between bg-background/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold">Career Assistant</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentRoadmap ? (
            <Badge variant="outline" className="hidden sm:flex gap-1 items-center px-3 py-1">
              <Info className="h-3 w-3" />
              Context: {currentRoadmap.career_goal}
            </Badge>
          ) : (
            <Badge variant="secondary" className="hidden sm:flex gap-1 items-center px-3 py-1">
              No Roadmap Active
            </Badge>
          )}
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 sm:px-6 py-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-4">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Hello! I'm your career assistant.</h2>
              <p className="text-muted-foreground max-w-sm">
                Ask me anything about your roadmap, interview prep, or career advice.
              </p>
              {!currentRoadmap && (
                <Card className="bg-primary/5 border-primary/20 max-w-md mt-6">
                  <CardContent className="pt-6">
                    <p className="text-sm">
                      <strong>Tip:</strong> Generate a roadmap first so I can provide more personalized advice based on your goals.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className={`h-8 w-8 shrink-0 mt-1 ${message.role === 'user' ? 'order-2' : ''}`}>
                {message.role === 'user' ? (
                  <>
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                )}
              </Avatar>

              <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted rounded-tl-none'
                    }`}
                >
                  {message.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 sm:p-6 border-t bg-background/50 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          <div className="flex gap-2 items-end">
            <div className="relative flex-1">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-auto min-w-[120px] bg-background border-none shadow-none focus:ring-0 text-xs">
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
                className="pl-[140px] h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
            </div>
            <Button
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0"
              disabled={!input.trim() || isLoading}
              onClick={handleSend}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground">
            AI can make mistakes. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
