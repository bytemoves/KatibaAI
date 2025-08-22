'use client';

import { Message } from '@/types/chat';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserIcon, ScaleIcon, FileTextIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';

  return (
    <div
      className={cn(
        "flex gap-3 max-w-4xl mx-auto",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 rounded-full flex-shrink-0">
        {isUser ? (
          <div className="bg-blue-600 text-white w-full h-full flex items-center justify-center rounded-full">
            <UserIcon className="h-4 w-4" />
          </div>
        ) : (
          <div className="bg-gray-800 text-white w-full h-full flex items-center justify-center rounded-full">
            <ScaleIcon className="h-4 w-4" />
          </div>
        )}
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">
            {isUser ? 'You' : 'Legal AI Assistant'}
          </span>
          {message.isStreaming && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              Thinking...
            </Badge>
          )}
        </div>

        <div
          className={cn(
            "rounded-xl px-4 py-3 shadow-sm whitespace-pre-wrap text-sm leading-relaxed",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-800"
          )}
        >
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse rounded" />
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <Card className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileTextIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Sources</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((source, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full border border-blue-300 bg-white text-blue-700"
                >
                  {source}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}