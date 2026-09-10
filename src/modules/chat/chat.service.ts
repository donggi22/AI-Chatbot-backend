import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { createAgent } from 'langchain';
import { getTemperature, getWeather } from './tools';
import { createLoggingMiddleware } from './middlewares';
import { ChatGroq } from '@langchain/groq';
import { streamChat } from '../../common/utils';
import { ChatStream } from './types';

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
    const agent = createAgent({
      model: new ChatGroq({
        model: 'qwen/qwen3.8-27b',
        reasoningEffort: 'none',
        maxTokens: 512,
      }),
      tools: [getWeather, getTemperature],
      middleware: [createLoggingMiddleware()],
    });

    await streamChat(
      res,
      () => {
        return agent.stream(
          {
            messages: [{ role: 'human', content: dto.message }],
          },
          { streamMode: ['messages', 'updates'] },
        );
      },
      {
        onError: (error) => {
          this.logger.error(error, 'Error in chat stream');
        },
      },
    );
  }
}
