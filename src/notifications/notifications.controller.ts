import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { RmqService } from 'src/rmq/rmq.service';
import { NotificationsService } from './notifications.service';
import type { EmailRequest } from 'src/mail/email.request.interface';
import { RmqMetricsInterceptor } from 'src/supervision/metrics/interceptors';

@Controller()
@UseInterceptors(RmqMetricsInterceptor)
export class NotificationsController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly notificationsService: NotificationsService,
  ) {}

  protected readonly logger = new Logger(NotificationsController.name);

  @EventPattern('notification.email.send')
  async sendNotificationEmail(@Ctx() context: RmqContext, @Payload() emailRequest: EmailRequest) {
    this.logger.log(`Received request to send notification email to ${emailRequest?.to}`);
    const event = 'notification.email.send';

    try {
      await this.notificationsService.sendNotificationEmail(emailRequest);
      this.rmqService.ackMessage(context, event);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send notification email to ${emailRequest.to}: ${errorMessage}`);
      this.rmqService.nackMessage(context, event, false);
      throw error;
    }
  }
}
