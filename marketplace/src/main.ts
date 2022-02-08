import Vue from 'vue';
import App from './App.vue';
import router from './router';
import Amplify, { Auth } from 'aws-amplify';
import {
  applyPolyfills,
  defineCustomElements,
} from '@aws-amplify/ui-components/loader';
import 'bulma/css/bulma.css';

Vue.config.productionTip = false;

Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: process.env.VUE_APP_API_ENDPOINT,
        custom_header: async () => {
          const currentSession = await Auth.currentSession();
          if (currentSession) {
            return {
              Authorization: `Bearer ${currentSession.getIdToken().getJwtToken()}`,
            };
          }
          return {};
        },
      },
    ],
  },
  Auth: {
    region: process.env.VUE_APP_AWS_REGION,
    userPoolId: process.env.VUE_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
  },
});

applyPolyfills().then(() => {
  defineCustomElements(window);
});

Vue.config.ignoredElements = [/amplify-\w*/];

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
