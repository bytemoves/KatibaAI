'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { SendIcon, StopCircleIcon } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { ScaleIcon, MessageSquareIcon, TrashIcon, PlusIcon } from 'lucide-react';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    currentConversation,
    isLoading,
    sendMessage,
    createNewConversation,
  } = useChat();

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConversation?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');
    await sendMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const sampleQuestions = [
    "What are the essential elements of a valid contract?",
    "What rights do tenants have under Kenyan law?",
    "How is intellectual property protected?",
  ];

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Legal AI Assistant</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createNewConversation()}
            className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
          >
            <span className="mr-1">+</span>
            New Query
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        {currentConversation && currentConversation.messages.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {currentConversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <ScaleIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Legal AI Assistant</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Ask me any legal question and I’ll reference laws and documents to provide accurate insights.
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs px-3 py-1 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition"
                    onClick={() => {
                      setInput(question);
                      textareaRef.current?.focus();
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-gray-50 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a legal question..."
              className="flex-1 resize-none border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg shadow-sm transition"
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition"
            >
              {isLoading ? (
                <StopCircleIcon className="h-4 w-4" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}