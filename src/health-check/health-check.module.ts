import { Module } from '@nestjs/common';

import { HealthCheckController } from './health-check.controller';
import { RmqService } from 'src/rmq/rmq.service';

@Module({
  controllers: [HealthCheckController],
  providers: [RmqService],
})
export class HealthCheckModule {}
