import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs/promises';
import * as Handlebars from 'handlebars';

import { TemplateService } from '../template.service';

jest.mock('fs/promises');
jest.mock('handlebars');

describe('TemplateService', () => {
  let service: TemplateService;
  let mockReadFile: jest.MockedFunction<typeof fs.readFile>;
  let mockCompile: jest.MockedFunction<typeof Handlebars.compile>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
    mockCompile = Handlebars.compile as jest.MockedFunction<typeof Handlebars.compile>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTemplate', () => {
    it('should read template file and compile it', async () => {
      const templateContent = '<p>Hello {{name}}</p>';
      const compiledResult = '<p>Hello John</p>';
      const mockCompiledTemplate = jest.fn().mockReturnValue(compiledResult);

      mockReadFile.mockResolvedValue(templateContent);
      mockCompile.mockReturnValue(mockCompiledTemplate);

      const result = await service.getTemplate('test-template', { name: 'John' });

      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining('src/mail/templates/test-template.hbs'),
        'utf-8',
      );
      expect(mockCompile).toHaveBeenCalledWith(templateContent);
      expect(mockCompiledTemplate).toHaveBeenCalledWith({ name: 'John' });
      expect(result).toBe(compiledResult);
    });

    it('should cache compiled templates', async () => {
      const templateContent = '<p>Hello {{name}}</p>';
      const mockCompiledTemplate = jest.fn().mockReturnValue('<p>Hello Test</p>');

      mockReadFile.mockResolvedValue(templateContent);
      mockCompile.mockReturnValue(mockCompiledTemplate);

      // First call
      await service.getTemplate('cached-template', { name: 'First' });
      // Second call with same template
      await service.getTemplate('cached-template', { name: 'Second' });

      // File should only be read once
      expect(mockReadFile).toHaveBeenCalledTimes(1);
      expect(mockCompile).toHaveBeenCalledTimes(1);
      // But the compiled template should be called twice
      expect(mockCompiledTemplate).toHaveBeenCalledTimes(2);
      expect(mockCompiledTemplate).toHaveBeenNthCalledWith(1, { name: 'First' });
      expect(mockCompiledTemplate).toHaveBeenNthCalledWith(2, { name: 'Second' });
    });

    it('should use different cache entries for different templates', async () => {
      const template1Content = '<p>Template 1: {{value}}</p>';
      const template2Content = '<p>Template 2: {{value}}</p>';
      const mockCompiledTemplate1 = jest.fn().mockReturnValue('<p>Template 1: A</p>');
      const mockCompiledTemplate2 = jest.fn().mockReturnValue('<p>Template 2: B</p>');

      mockReadFile.mockResolvedValueOnce(template1Content).mockResolvedValueOnce(template2Content);
      mockCompile.mockReturnValueOnce(mockCompiledTemplate1).mockReturnValueOnce(mockCompiledTemplate2);

      const result1 = await service.getTemplate('template-1', { value: 'A' });
      const result2 = await service.getTemplate('template-2', { value: 'B' });

      expect(mockReadFile).toHaveBeenCalledTimes(2);
      expect(mockCompile).toHaveBeenCalledTimes(2);
      expect(result1).toBe('<p>Template 1: A</p>');
      expect(result2).toBe('<p>Template 2: B</p>');
    });

    it('should throw error when template file does not exist', async () => {
      const error = new Error('ENOENT: no such file or directory');
      mockReadFile.mockRejectedValue(error);

      await expect(service.getTemplate('non-existent', { name: 'Test' })).rejects.toThrow(
        'ENOENT: no such file or directory',
      );
    });

    it('should handle empty context object', async () => {
      const templateContent = '<p>Static content</p>';
      const compiledResult = '<p>Static content</p>';
      const mockCompiledTemplate = jest.fn().mockReturnValue(compiledResult);

      mockReadFile.mockResolvedValue(templateContent);
      mockCompile.mockReturnValue(mockCompiledTemplate);

      const result = await service.getTemplate('static-template', {});

      expect(mockCompiledTemplate).toHaveBeenCalledWith({});
      expect(result).toBe(compiledResult);
    });

    it('should construct correct template path using process.cwd()', async () => {
      const templateContent = '<p>Test</p>';
      const mockCompiledTemplate = jest.fn().mockReturnValue('<p>Test</p>');

      mockReadFile.mockResolvedValue(templateContent);
      mockCompile.mockReturnValue(mockCompiledTemplate);

      await service.getTemplate('verify-email', {});

      const expectedPath = `${process.cwd()}/src/mail/templates/verify-email.hbs`;
      expect(mockReadFile).toHaveBeenCalledWith(expectedPath, 'utf-8');
    });
  });
});
