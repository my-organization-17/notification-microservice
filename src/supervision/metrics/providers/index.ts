export * from './rmq.metrics';

import { rmqMetricProviders } from './rmq.metrics';

export const allMetricProviders = [...rmqMetricProviders];
