import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { RmqService } from 'src/rmq/rmq.service';

interface HealthCheckResponse {
  serving: boolean;
  message: string;
}

@Controller()
export class HealthCheckController {
  constructor(private readonly rmqService: RmqService) {}
  protected readonly logger = new Logger(HealthCheckController.name);

  @MessagePattern('health.check')
  healthCheck(@Ctx() context: RmqContext): HealthCheckResponse {
    this.logger.log('Health check requested');
    this.rmqService.ackMessage(context);
    return {
      serving: true,
      message: 'Notification microservice is healthy',
    };
  }
}
