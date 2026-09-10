import { IterableReadableStream } from '@langchain/core/utils/stream';
import { ChatStream, ChatToolStream } from '../../modules/chat/types';
import { Response } from 'express';
import {
  getLastAIMessageChunk,
  getLastToolMessage,
  isAIChunkWithText,
  isAIChunkWithToolCalls,
} from './stream.utils';
import { ToolMessage } from 'langchain';

export async function streamChat(
  res: Response,
  getChatStream: () => Promise<IterableReadableStream<any>>,
  callbacks: {
    onToolArgs?: (stream: ChatToolStream) => void;
    onToolComplete?: (stream: ChatToolStream) => void;
    onAIChunk?: (stream: ChatStream) => void;
    onError?: (error: Error) => void;
  } = {},
) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('cache-Control', 'no-cache');

  const send = (stream: ChatStream) => {
    res.write(`${JSON.stringify(stream)}\n`);
  };

  try {
    const stream = await getChatStream();

    for await (const [event, data] of stream) {
      // ! 중간 업데이트 스트림
      if (event === 'updates') {
        const chunk = getLastAIMessageChunk(data);
        //  AI Tool Call Args 추적
        if (isAIChunkWithToolCalls(chunk)) {
          // 도구 호출 Args 스트림
          for (const toolCall of chunk.tool_calls) {
            const chatStream: ChatStream = {
              role: 'tool',
              id: toolCall.id,
              name: toolCall.name,
              args: JSON.stringify(toolCall.args),
            };
            callbacks.onToolArgs?.(chatStream);
            send(chatStream);
          }
        }
        // AI Tool Output 추적
        const toolMessage = getLastToolMessage(data);
        if (toolMessage && ToolMessage.isInstance(toolMessage)) {
          const chatStream: ChatStream = {
            role: 'tool',
            id: toolMessage.tool_call_id,
            name: toolMessage.name || '',
            content: JSON.stringify(toolMessage.content),
          };
          callbacks.onToolComplete?.(chatStream);
          send(chatStream);
        }
      }

      // ! AI 최종 결과 스트림
      if (event === 'messages') {
        const [chunk] = data;
        if (isAIChunkWithText(chunk)) {
          const chatStream: ChatStream = {
            id: chunk.id,
            role: 'ai',
            content: chunk.text,
          };
          callbacks.onAIChunk?.(chatStream);
          send(chatStream);
        }
      }
    }
  } catch (error) {
    callbacks.onError?.(error as Error);
  } finally {
    res.end();
  }
}
