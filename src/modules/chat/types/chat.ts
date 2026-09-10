export type ChatAIStream = {
  id: string;
  role: 'ai';
  content: string;
};

export type ChatToolStream = {
  id: string;
  role: 'tool';
  name: string;
  args?: string;
  content?: string;
};

export type ChatStream = ChatAIStream | ChatToolStream;
