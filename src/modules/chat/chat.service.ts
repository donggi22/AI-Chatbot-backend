import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto';
import { Response } from 'express';
import { ChatStream } from './types';
import { PinoLogger } from 'nestjs-pino';
import { createAgent, createMiddleware } from 'langchain';
import { getTemperature, getWeather } from './tools';
import { createLoggingMiddleware } from './middlewares';
import { AIMessage, ToolMessage } from '@langchain/core/messages';
import {
  getLastAIMessageChunk,
  getLastToolMessage,
  isAIChunkWithText,
  isAIChunkWithToolCalls,
} from '../../common/utils';
import { ChatGroq } from '@langchain/groq';

@Injectable()
export class ChatService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ChatService.name);
  }

  async sendMessage({ message }: SendMessageDto) {
    const agent = createAgent({
      model: new ChatGroq({
        model: 'qwen/qwen3.8-27b',
        reasoningEffort: 'none',
        maxTokens: 512,
      }),
      tools: [getWeather, getTemperature],
      middleware: [createLoggingMiddleware()],
    });

    const response = await agent.invoke({
      messages: [{ role: 'human', content: message }],
    });

    return { answer: response.messages.at(-1)?.text ?? '' }; // .content가 문자열과 배열 둘 다 반환, .text는 항상 문자열로 반환
  }

  async streamMessage(dto: SendMessageDto, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('cache-Control', 'no-cache');

    try {
      const agent = createAgent({
        model: new ChatGroq({
          model: 'qwen/qwen3.8-27b',
          reasoningEffort: 'none',
          maxTokens: 512,
        }),
        tools: [getWeather, getTemperature],
        middleware: [createLoggingMiddleware()],
      });

      const stream = await agent.stream(
        {
          messages: [{ role: 'human', content: dto.message }],
        },
        { streamMode: ['messages', 'updates'] },
      );

      for await (const [event, data] of stream) {
        // ! 중간 업데이트 스트림
        if (event === 'updates') {
          const chunk = getLastAIMessageChunk(data);
          //  AI Tool Call Args 추적
          if (isAIChunkWithToolCalls(chunk)) {
            // 도구 호출 Args 스트림
            for (const toolCall of chunk.tool_calls) {
              console.log(
                `🔧Tool Called: ${toolCall.name}(${toolCall.id})`,
                toolCall.args,
              );
            }
          }
          // AI Tool Output 추적
          const toolMessage = getLastToolMessage(data);
          if (toolMessage && ToolMessage.isInstance(toolMessage)) {
            console.log(
              `🛠️ Tool Output: ${toolMessage.name}(${toolMessage.tool_call_id})`,
              {
                content: toolMessage.content,
              },
            );
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
            res.write(`${JSON.stringify(chatStream)}\n`);
          }
        }
      }
    } catch (error) {
      this.logger.error(error, 'Error streaming message');
    } finally {
      res.end();
    }
  }
}
