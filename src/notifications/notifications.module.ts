import { Module } from '@nestjs/common';

import { MailService } from 'src/mail/mail.service';
import { RmqService } from 'src/rmq/rmq.service';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, MailService, RmqService],
})
export class NotificationsModule {}
