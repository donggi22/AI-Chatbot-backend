import { StringValidation } from 'zod/v3';

export type ChatAIStream = {
  id: string;
  role: 'ai';
  content: String;
};

export type ChatStream = ChatAIStream;
