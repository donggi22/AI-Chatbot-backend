import { Global, Module } from '@nestjs/common';
import { Config } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  providers: [Config],
  exports: [Config],
})
export class ConfigModule {}
