import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation } from '@/types/chat';
import { streamQuery } from '@/lib/api';

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Legal Query',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation;
  }, []);

  const updateConversationTitle = useCallback((conversationId: string, title: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, title, updatedAt: new Date() } : conv
    ));
  }, []);

  const addMessage = useCallback((conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, message],
            updatedAt: new Date()
          }
        : conv
    ));
  }, []);

  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<Message>) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            updatedAt: new Date()
          }
        : conv
    ));
  }, []);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim()) return;

    let conversationId = currentConversationId;
    
    
    if (!conversationId) {
      const newConv = createNewConversation();
      conversationId = newConv.id;
    }

    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    };

    addMessage(conversationId, userMessage);
    const assistantMessage: Message = {
      id: uuidv4(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    addMessage(conversationId, assistantMessage);
    setIsLoading(true);

    try {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv && conv.messages.length <= 1) {
        const title = question.slice(0, 50) + (question.length > 50 ? '...' : '');
        updateConversationTitle(conversationId, title);
      }

      let sources: string[] = [];
      let content = '';

      for await (const chunk of streamQuery(question)) {
        const { data } = chunk;

        if (data.sources) {
          sources = data.sources;
          updateMessage(conversationId, assistantMessage.id, { sources });
        }

        if (data.content) {
          content += data.content;
          updateMessage(conversationId, assistantMessage.id, { 
            content,
            sources,
            isStreaming: true 
          });
        }

        if (data.error) {
          updateMessage(conversationId, assistantMessage.id, { 
            content: `Error: ${data.error}`,
            isStreaming: false 
          });
          break;
        }
      }
      updateMessage(conversationId, assistantMessage.id, { 
        isStreaming: false 
      });

    } catch (error) {
      console.error('Error sending message:', error);
      updateMessage(conversationId, assistantMessage.id, { 
        content: 'Sorry, I encountered an error. Please try again.',
        isStreaming: false 
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, conversations, createNewConversation, addMessage, updateMessage, updateConversationTitle]);

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  return {
    conversations,
    currentConversation,
    isLoading,
    createNewConversation,
    sendMessage,
    selectConversation,
    deleteConversation,
  };
}
