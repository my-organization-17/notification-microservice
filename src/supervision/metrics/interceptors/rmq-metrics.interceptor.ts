import 'reflect-metadata';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';

import {
  RMQ_EVENT_DURATION_SECONDS,
  RMQ_EVENTS_FAILED_TOTAL,
  RMQ_EVENTS_SUCCESS_TOTAL,
  RMQ_EVENTS_TOTAL,
} from '../providers';

const SERVICE_NAME = 'notification-microservice';

@Injectable()
export class RmqMetricsInterceptor implements NestInterceptor {
  public constructor(
    @InjectMetric(RMQ_EVENT_DURATION_SECONDS)
    private readonly rmqEventDurationSeconds: Histogram<string>,
    @InjectMetric(RMQ_EVENTS_TOTAL)
    private readonly rmqEventsTotal: Counter<string>,
    @InjectMetric(RMQ_EVENTS_SUCCESS_TOTAL)
    private readonly rmqEventsSuccessTotal: Counter<string>,
    @InjectMetric(RMQ_EVENTS_FAILED_TOTAL)
    private readonly rmqEventsFailedTotal: Counter<string>,
  ) {}

  public intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const pattern = this.extractEventPattern(context);
    if (!pattern) {
      return next.handle();
    }

    const labels = {
      service: SERVICE_NAME,
      event: pattern,
    };

    const end = this.rmqEventDurationSeconds.startTimer(labels);

    return next.handle().pipe(
      tap({
        next: () => {
          this.rmqEventsTotal.inc({ ...labels, status: 'success' });
          this.rmqEventsSuccessTotal.inc(labels);
          end({ status: 'success' });
        },
        error: () => {
          this.rmqEventsTotal.inc({ ...labels, status: 'failed' });
          this.rmqEventsFailedTotal.inc(labels);
          end({ status: 'failed' });
        },
      }),
    );
  }

  private extractEventPattern(context: ExecutionContext): string | null {
    const handler = context.getHandler();
    const eventPattern = Reflect.getMetadata('microservices:pattern', handler) as string | string[] | undefined;

    if (Array.isArray(eventPattern) && eventPattern.length > 0) {
      return String(eventPattern[0]);
    }

    if (eventPattern) {
      return String(eventPattern);
    }

    return handler.name;
  }
}
