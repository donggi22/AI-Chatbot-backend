import { Body, Controller, Post, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto';
import type { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(@Body() dto: SendMessageDto): Promise<{ answer: string }> {
    return this.chatService.sendMessage(dto);
  }
  @Post('stream')
  async streamMessage(@Body() dto: SendMessageDto, @Res() res: Response) {
    await this.chatService.streamMessage(dto, res);
  }
}
