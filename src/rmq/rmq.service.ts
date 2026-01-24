/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  private readonly logger = new Logger(RmqService.name);

  ackMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const tag = originalMessage?.fields.deliveryTag;
    if (!tag) {
      this.logger.error('Delivery tag is missing in the original message fields');
      return;
    }
    channel.ack(originalMessage);
    this.logger.log(`Message with content ${originalMessage.content.toString()} acknowledged`);
  }

  nackMessage(context: RmqContext, requeue = false) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const tag = originalMessage?.fields.deliveryTag;
    if (!tag) {
      this.logger.error('Delivery tag is missing in the original message fields');
      return;
    }
    channel.nack(originalMessage, false, requeue);
    if (requeue) {
      this.logger.warn(`Message with content ${originalMessage.content.toString()} not acknowledged and requeued`);
    } else {
      this.logger.warn(`Message with content ${originalMessage.content.toString()} not acknowledged and discarded`);
    }
  }
}
