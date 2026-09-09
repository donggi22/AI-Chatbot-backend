import { AIMessage, AIMessageChunk, ToolCall, ToolMessage } from 'langchain';

export function isAIChunkWithToolCalls(
  chunk: any,
): chunk is AIMessageChunk & { tool_calls: ToolCall[] } {
  return (
    chunk?.type === 'ai' &&
    Array.isArray(chunk?.tool_calls && chunk.tool_calls.length > 0)
  );
}

export function isAIChunkWithText(
  chunk: any,
): chunk is AIMessageChunk & { id: string; text: string } {
  return (
    chunk?.type === 'ai' &&
    typeof chunk.text === 'string' &&
    chunk.text.length > 0
  );
}

export function getLastAIMessageChunk(data: any): AIMessageChunk | undefined {
  const message = data?.model_request?.messages?.at(-1);
  if (message?.type === 'ai') {
    return message;
  }
  return undefined;
}

export function getLastToolMessage(data: any): ToolMessage | undefined {
  return data?.tools?.messages?.at(-1);
}
