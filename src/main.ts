import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { setupSwagger } from './core/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });


  app.enableCors({
    origin: "http://localhost:5173",
  })
  app.setGlobalPrefix('api')
  setupSwagger(app);
  app.useLogger(app.get(Logger));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
