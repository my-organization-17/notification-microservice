/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';
import { HealthCheckController } from './health-check.controller';
import { RmqService } from 'src/rmq/rmq.service';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;
  let rmqService: jest.Mocked<RmqService>;

  const mockRmqService = {
    ackMessage: jest.fn(),
    nackMessage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: RmqService,
          useValue: mockRmqService,
        },
      ],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
    rmqService = module.get(RmqService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthCheck', () => {
    let mockContext: RmqContext;

    beforeEach(() => {
      mockContext = {
        getChannelRef: jest.fn(),
        getMessage: jest.fn(),
        getPattern: jest.fn(),
        getArgs: jest.fn(),
      } as unknown as RmqContext;
    });

    it('should return health check response with serving true', () => {
      const response = controller.healthCheck(mockContext);

      expect(response).toEqual({
        serving: true,
        message: 'Notification microservice is healthy',
      });
    });

    it('should acknowledge the message via RmqService', () => {
      controller.healthCheck(mockContext);

      expect(rmqService.ackMessage).toHaveBeenCalledTimes(1);
      expect(rmqService.ackMessage).toHaveBeenCalledWith(mockContext);
    });

    it('should return response with correct structure', () => {
      const response = controller.healthCheck(mockContext);

      expect('serving' in response).toBe(true);
      expect('message' in response).toBe(true);
      expect(typeof response.serving).toBe('boolean');
      expect(typeof response.message).toBe('string');
    });
  });
});
