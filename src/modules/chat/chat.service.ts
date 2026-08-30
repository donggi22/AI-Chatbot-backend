import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto';
import { ChatGroq } from '@langchain/groq';

@Injectable()
export class ChatService {
  async sendMessage({ message }: SendMessageDto): Promise<{ answer: string }> {
    const llm = new ChatGroq({ model: 'openai/gpt-oss-120b' });

    const response = await llm.invoke(message);

    return { answer: response.text };
  }
}
