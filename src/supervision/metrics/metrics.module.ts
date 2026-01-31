import { Global, Module } from '@nestjs/common';
import { makeCounterProvider, makeHistogramProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    makeHistogramProvider({
      name: 'rmq_event_duration_seconds',
      help: 'Duration of RMQ event processing in seconds',
      labelNames: ['service', 'event', 'status'],
      buckets: [0.1, 0.5, 1, 2.5, 5, 10],
    }),
    makeCounterProvider({
      name: 'rmq_events_total',
      help: 'Total number of RMQ events processed',
      labelNames: ['service', 'event', 'status'],
    }),
    makeCounterProvider({
      name: 'rmq_events_success_total',
      help: 'Total number of successful RMQ events',
      labelNames: ['service', 'event'],
    }),
    makeCounterProvider({
      name: 'rmq_events_failed_total',
      help: 'Total number of failed RMQ events',
      labelNames: ['service', 'event'],
    }),
  ],
  // exports: ['rmq_event_duration_seconds', 'rmq_events_total', 'rmq_events_success_total', 'rmq_events_failed_total'],
  exports: [
    'PROM_METRIC_RMQ_EVENT_DURATION_SECONDS',
    'PROM_METRIC_RMQ_EVENTS_TOTAL',
    'PROM_METRIC_RMQ_EVENTS_SUCCESS_TOTAL',
    'PROM_METRIC_RMQ_EVENTS_FAILED_TOTAL',
  ],
})
export class MetricsModule {}
