import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Config {
    constructor(private readonly configService: ConfigService) {}

    get nodeEnv(): string {
        return this.configService.get<string>('NODE_ENV', '');
    }
}
