import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(@Body() dto: SendMessageDto): Promise<{ answer: string }> {
    return this.chatService.sendMessage(dto);
  }
}
