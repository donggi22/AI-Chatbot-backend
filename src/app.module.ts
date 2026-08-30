import { Module, Logger } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ConfigModule } from './config/config.module';
import { pinoHttp } from './config/pino.config';
import { LoggerModule } from 'nestjs-pino';
import { globalProviders } from './core/providers';
import { ChatModule } from './modules/chat/chat.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [LoggerModule.forRoot({ pinoHttp }), ConfigModule, ChatModule],
  providers: [...globalProviders],
})
export class AppModule {}
