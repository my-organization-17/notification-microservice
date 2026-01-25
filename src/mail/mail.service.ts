import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import type { EmailRequest } from './email.request.interface';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(emailRequest: EmailRequest) {
    await this.mailerService.sendMail({
      to: emailRequest.to,
      subject: emailRequest.subject,
      html: emailRequest.html,
      template: emailRequest.template,
      context: emailRequest.context,
    });
  }
}
