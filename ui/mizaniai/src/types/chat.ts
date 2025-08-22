export interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: string[];
    isStreaming?: boolean;
  }
  
  export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface StreamResponse {
    event: string;
    data: {
      message?: string;
      sources?: string[];
      doc_count?: number;
      content?: string;
      error?: string;
    };
  }