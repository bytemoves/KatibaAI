'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { ChatInterface } from '@/components/chat/chat-interface';
import { useChat } from '@/hooks/use-chat';

export default function Home() {
  const {
    conversations,
    currentConversation,
    createNewConversation,
    selectConversation,
    deleteConversation,
  } = useChat();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onNewConversation={createNewConversation}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatInterface />
      </main>
    </div>
  );
}