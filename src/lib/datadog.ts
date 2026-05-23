import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

datadogRum.init({
    applicationId: import.meta.env.VITE_DATADOG_APP_ID,
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
    site: 'ap2.datadoghq.com',
    service: 'mirabile',
    env: import.meta.env.VITE_ENV || 'prod',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackResources: true,
    trackUserInteractions: true,
    trackLongTasks: true,
    plugins: [reactPlugin({ router: false })],
});