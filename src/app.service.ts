import { Injectable } from '@nestjs/common';
import { Config } from './config/config.service.js';

@Injectable()
export class AppService {
  constructor(private readonly config: Config) {}

  getHello(): string {
    const env = this.config.nodeEnv;
    return `Hello World! Env: ${env}`;
  }
}
