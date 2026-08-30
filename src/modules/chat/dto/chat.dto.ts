import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const SendMessageSchema = z.object({
  message: z.string().min(1).max(1000),
});

export class SendMessageDto extends createZodDto(SendMessageSchema) {}
