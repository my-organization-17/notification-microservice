import { Global, Module } from '@nestjs/common';
import { RmqService } from './rmq.service';

@Global()
@Module({
  controllers: [],
  providers: [RmqService],
})
export class RmqModule {}
