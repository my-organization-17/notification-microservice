import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { RmqService } from 'src/rmq/rmq.service';
import { NotificationsService } from './notifications.service';
import type { EmailRequest } from 'src/mail/email.request.interface';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Controller()
export class NotificationsController {
  private readonly SERVICE_NAME: string;

  constructor(
    private readonly rmqService: RmqService,
    private readonly notificationsService: NotificationsService,
    @InjectMetric('rmq_event_duration_seconds') private readonly rmqEventDurationSecondsHistogram: Histogram<string>,
    @InjectMetric('rmq_events_total') private readonly rmqEventsTotal: Counter<string>,
  ) {
    this.SERVICE_NAME = 'notification-microservice';
  }

  protected readonly logger = new Logger(NotificationsController.name);

  @EventPattern('notification.email.send')
  async sendNotificationEmail(@Ctx() context: RmqContext, @Payload() emailRequest: EmailRequest) {
    this.logger.log(`Received request to send notification email to ${emailRequest?.to}`);
    const event = 'notification.email.send';

    const end = this.rmqEventDurationSecondsHistogram.startTimer({
      service: this.SERVICE_NAME,
      event,
    });
    try {
      await this.notificationsService.sendNotificationEmail(emailRequest);
      this.rmqEventsTotal.inc({
        service: this.SERVICE_NAME,
        event,
        status: 'success',
      });
      end({ status: 'success' });
      this.rmqService.ackMessage(context, event);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send notification email to ${emailRequest.to}: ${errorMessage}`);
      this.rmqService.nackMessage(context, event, false);
      this.rmqEventsTotal.inc({
        service: this.SERVICE_NAME,
        event,
        status: 'failed',
      });
      end({ status: 'failed' });
    }
  }
}
