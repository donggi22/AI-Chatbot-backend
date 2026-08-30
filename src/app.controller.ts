import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {z} from 'zod';

const TestSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0, '나이는 0 이상이어야 합니다.'),
})


class TestDto extends createZodDto(TestSchema) {}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @ZodResponse({ type: TestDto })
  createTest(@Body() body: TestDto) {
    return {
      ...body,
      message: 'Test created successfully',
    }
  }
}
