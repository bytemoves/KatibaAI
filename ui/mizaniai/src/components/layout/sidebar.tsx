
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, MessageSquareIcon, TrashIcon , ScaleIcon } from 'lucide-react';
import { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';


interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-50 border-r border-gray-200 z-10 hidden md:block">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <ScaleIcon size={16} color="white" />
          </div>
          <h1 className="font-semibold text-gray-900">Legal AI</h1>
        </div>
      </div>

      <div className="p-4">
        <Button
          onClick={onNewConversation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Query
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition",
                currentConversationId === conv.id && "bg-blue-50 border border-blue-200"
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquareIcon className="h-4 w-4 text-gray-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{conv.title}</p>
                <p className="text-xs text-gray-500">{conv.messages.length} messages</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-500"
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="outline" className="text-xs">Beta</Badge>
          <span>Legal AI Assistant</span>
        </div>
      </div>
    </div>
  );
}