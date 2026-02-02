/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';

import { MailService } from '../mail.service';
import { TemplateService } from '../template.service';
import type { EmailRequest } from '../email.request.interface';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;
  let templateService: TemplateService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockTemplateService = {
    getTemplate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: TemplateService,
          useValue: mockTemplateService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get(MailerService);
    templateService = module.get(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    it('should send email with html content when html is provided', async () => {
      const emailRequest: EmailRequest = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      await service.sendMail(emailRequest);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        context: undefined,
      });
    });

    it('should send email with template when template is provided', async () => {
      const emailRequest: EmailRequest = {
        to: 'test@example.com',
        subject: 'Verification Email',
        template: 'verify-email',
        context: { name: 'John', link: 'https://example.com/verify' },
      };

      mockTemplateService.getTemplate.mockResolvedValue(
        '<p>Hello John, click <a href="https://example.com/verify">here</a></p>',
      );

      await service.sendMail(emailRequest);

      expect(templateService.getTemplate).toHaveBeenCalledTimes(1);
      expect(templateService.getTemplate).toHaveBeenCalledWith('verify-email', {
        name: 'John',
        link: 'https://example.com/verify',
      });
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Verification Email',
        html: '<p>Hello John, click <a href="https://example.com/verify">here</a></p>',
        context: { name: 'John', link: 'https://example.com/verify' },
      });
    });

    it('should use empty context when template is provided without context', async () => {
      const emailRequest: EmailRequest = {
        to: 'test@example.com',
        subject: 'Simple Template',
        template: 'simple-template',
      };

      mockTemplateService.getTemplate.mockResolvedValue('<p>Static content</p>');

      await service.sendMail(emailRequest);

      expect(templateService.getTemplate).toHaveBeenCalledWith('simple-template', {});
    });

    it('should throw error when neither html nor template is provided', async () => {
      const emailRequest: EmailRequest = {
        to: 'test@example.com',
        subject: 'No Content',
      };

      await expect(service.sendMail(emailRequest)).rejects.toThrow(
        'Either html content or a template must be provided.',
      );

      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });

    it('should prefer template over html when both are provided', async () => {
      const emailRequest: EmailRequest = {
        to: 'test@example.com',
        subject: 'Both Provided',
        html: '<p>Direct HTML</p>',
        template: 'some-template',
        context: { key: 'value' },
      };

      mockTemplateService.getTemplate.mockResolvedValue('<p>Template HTML</p>');

      await service.sendMail(emailRequest);

      expect(templateService.getTemplate).toHaveBeenCalledWith('some-template', { key: 'value' });
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Both Provided',
        html: '<p>Template HTML</p>',
        context: { key: 'value' },
      });
    });

    it('should propagate error when mailerService.sendMail fails', async () => {
      const emailRequest: EmailRequest = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      const error = new Error('SMTP connection failed');
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(service.sendMail(emailRequest)).rejects.toThrow('SMTP connection failed');
    });

    it('should propagate error when templateService.getTemplate fails', async () => {
      const emailRequest: EmailRequest = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'non-existent-template',
        context: {},
      };

      const error = new Error('Template not found');
      mockTemplateService.getTemplate.mockRejectedValue(error);

      await expect(service.sendMail(emailRequest)).rejects.toThrow('Template not found');
      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });
  });
});
