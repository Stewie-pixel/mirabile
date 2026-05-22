import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

datadogRum.init({
    applicationId: '2c114bde-b872-41a5-b40e-746b3720eac2',
    clientToken: 'pub779ccb2ba4c3dcd28ce0e8da7ba34842',
    site: 'ap2.datadoghq.com',
    service: 'mirabile',
    env: 'prod',
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackResources: true,
    trackUserInteractions: true,
    trackLongTasks: true,
    plugins: [reactPlugin({ router: false })],
});