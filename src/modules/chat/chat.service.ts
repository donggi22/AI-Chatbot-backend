import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto';
import { ChatGroq } from '@langchain/groq';
import { Response } from 'express';
import { ChatStream } from './types';
import { PinoLogger } from 'nestjs-pino';
import { createAgent, createMiddleware } from 'langchain';
import { getTemperature, getWeather } from './tools';
import { createLoggingMiddleware } from './middlewares';

@Injectable()
export class ChatService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ChatService.name);
  }

  async sendMessage({ message }: SendMessageDto) {
    const agent = createAgent({
      model: 'groq:qwen/qwen3.8-27b',
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
      const llm = new ChatGroq({
        model: 'qwen/qwen3.8-27b',
      });

      const stream = await llm.stream(dto.message);
      const aiID = crypto.randomUUID();
      for await (const chunk of stream) {
        const chatStream: ChatStream = {
          id: aiID,
          role: 'ai',
          content: chunk.text,
        };
        res.write(`${JSON.stringify(chatStream)}\n`);
      }
    } catch (error) {
      this.logger.error(error, 'Error streaming message');
    } finally {
      res.end();
    }
  }
}
