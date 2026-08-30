import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto';
import { ChatGroq } from '@langchain/groq';
import { Response } from 'express';
import { ChatStream } from './types';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ChatService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ChatService.name);
  }

  async sendMessage({ message }: SendMessageDto): Promise<{ answer: string }> {
    const llm = new ChatGroq({ model: 'openai/gpt-oss-120b' });

    const response = await llm.invoke(message);

    return { answer: response.text };
  }

  async streamMessage(dto: SendMessageDto, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('cache-Control', 'no-cache');

    try {
      const llm = new ChatGroq({
        model: 'openai/gpt-oss-120b',
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
