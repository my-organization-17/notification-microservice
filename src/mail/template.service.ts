import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

@Injectable()
export class TemplateService {
  private cache = new Map<string, Handlebars.TemplateDelegate>();

  async getTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    if (this.cache.has(templateName)) {
      return this.cache.get(templateName)!(context);
    }

    const templatePath = path.join(process.cwd(), 'src/mail/templates', `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateContent);
    this.cache.set(templateName, compiledTemplate);
    return compiledTemplate(context);
  }
}
