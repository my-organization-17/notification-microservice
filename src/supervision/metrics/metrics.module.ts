import { Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { allMetricProviders } from './providers';
import { RmqMetricsInterceptor } from './interceptors';

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
  providers: [...allMetricProviders, RmqMetricsInterceptor],
  exports: [...allMetricProviders, RmqMetricsInterceptor],
})
export class MetricsModule {}
