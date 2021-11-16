import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '../views/Home.vue';
import SignIn from '../views/SignIn.vue';
import Account from '../views/Account.vue';
import Create from '../views/Create.vue';
import Show from '../views/Show.vue';
import { Auth } from 'aws-amplify';
import { onAuthUIStateChange } from '@aws-amplify/ui-components';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      auth: true,
    },
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: SignIn,
  },
  {
    path: '/account',
    name: 'Account',
    component: Account,
    meta: {
      auth: true,
    },
  },
  {
    path: '/create',
    name: 'Create',
    component: Create,
    meta: {
      auth: true,
    },
  },
  {
    path: '/show/:id',
    name: 'Show',
    component: Show,
    meta: {
      auth: true,
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, _from, next) => {
  if (to.matched.some(r => r.meta.auth)) {
    try {
      const currentSession = await Auth.currentSession();

      if (currentSession) {
        next();
      } else {
        next({ path: '/signin' });
      }
    } catch (e) {
      next({ path: 'signin' });
    }
  } else {
    next();
  }
});

onAuthUIStateChange((authState: string) => {
  if (authState === 'signedout') {
    router.push({ path: 'signin' });
  }
});

export default router;
