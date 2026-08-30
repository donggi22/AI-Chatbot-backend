import { Module, Logger } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { pinoHttp } from './config/pino.config';
import { LoggerModule } from 'nestjs-pino';
import { globalProviders } from './core/providers';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [LoggerModule.forRoot({ pinoHttp }), ConfigModule],
  controllers: [AppController],
  providers: [AppService, ...globalProviders],
})
export class AppModule {}
