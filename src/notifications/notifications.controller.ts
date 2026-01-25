import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { RmqService } from 'src/rmq/rmq.service';
import { NotificationsService } from './notifications.service';
import type { EmailRequest } from 'src/mail/email.request.interface';

@Controller()
export class NotificationsController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly notificationsService: NotificationsService,
  ) {}

  protected readonly logger = new Logger(NotificationsController.name);

  @EventPattern('notification.email.send')
  async sendNotificationEmail(@Ctx() context: RmqContext, @Payload() emailRequest: EmailRequest) {
    this.logger.log(`Received request to send notification email to ${emailRequest?.to}`);
    try {
      await this.notificationsService.sendNotificationEmail(emailRequest);
      this.rmqService.ackMessage(context);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send notification email to ${emailRequest.to}: ${errorMessage}`);
      this.rmqService.nackMessage(context, false);
    }
  }
}
