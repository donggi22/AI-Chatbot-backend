import { cleanupOpenApiDoc } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('AI Chatbot API')
      .setDescription('AI Chatbot API description')
      .setVersion('1.0')
      .build(),
  );

  SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(openApiDoc));
}
