export type ChatAIStream = {
  id: string;
  role: 'ai';
  content: string;
};

export type ChatStream = ChatAIStream;
