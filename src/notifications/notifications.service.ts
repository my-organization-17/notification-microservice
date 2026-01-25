import { Injectable, Logger } from '@nestjs/common';

import { MailService } from 'src/mail/mail.service';
import type { EmailRequest } from 'src/mail/email.request.interface';

@Injectable()
export class NotificationsService {
  constructor(private readonly mailService: MailService) {}

  protected readonly logger = new Logger(NotificationsService.name);

  async sendNotificationEmail(emailRequest: EmailRequest) {
    this.logger.log(`Sending notification email to ${emailRequest.to} with subject "${emailRequest.subject}"`);
    await this.mailService.sendMail(emailRequest);
    this.logger.log(`Notification email sent to ${emailRequest.to}`);
  }
}
