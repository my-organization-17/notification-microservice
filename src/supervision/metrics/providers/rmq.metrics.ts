import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const RMQ_EVENT_DURATION_SECONDS = 'rmq_event_duration_seconds' as const;
export const RMQ_EVENTS_TOTAL = 'rmq_events_total' as const;
export const RMQ_EVENTS_SUCCESS_TOTAL = 'rmq_events_success_total' as const;
export const RMQ_EVENTS_FAILED_TOTAL = 'rmq_events_failed_total' as const;

export const rmqEventDurationSeconds = makeHistogramProvider({
  name: RMQ_EVENT_DURATION_SECONDS,
  help: 'Duration of RMQ event processing in seconds',
  labelNames: ['service', 'event', 'status'],
  buckets: [0.1, 0.5, 1, 2.5, 5, 10],
});

export const rmqEventsTotal = makeCounterProvider({
  name: RMQ_EVENTS_TOTAL,
  help: 'Total number of RMQ events processed',
  labelNames: ['service', 'event', 'status'],
});

export const rmqEventsSuccessTotal = makeCounterProvider({
  name: RMQ_EVENTS_SUCCESS_TOTAL,
  help: 'Total number of successful RMQ events',
  labelNames: ['service', 'event'],
});

export const rmqEventsFailedTotal = makeCounterProvider({
  name: RMQ_EVENTS_FAILED_TOTAL,
  help: 'Total number of failed RMQ events',
  labelNames: ['service', 'event'],
});

export const rmqMetricProviders = [
  rmqEventDurationSeconds,
  rmqEventsTotal,
  rmqEventsSuccessTotal,
  rmqEventsFailedTotal,
];
