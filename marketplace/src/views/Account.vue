<template>
  <div>
    <section class="section">
      <h1 class="title">{{ username }}</h1>

      <template v-if="account">
        <div class="mb-3">
          <h6 class="title is-6 mb-0">Address</h6>
          <span>{{ account.address }}</span>
        </div>

        <div class="mb-3">
          <h6 class="title is-6 mb-0">Balance</h6>
          <span>{{ account.balance }}</span>
        </div>

        <div class="mb-3">
          <h6 class="title is-6 mb-0">Private Key</h6>

          <template v-if="retrieve">
            <div class="mt-2">
              <span>{{ account.privateKey }}</span>
              <button class="button is-danger is-small is-rounded ml-2" @click="retrieve = false">Hide</button>
            </div>
          </template>

          <template v-else>
            <button class="button is-danger is-small is-rounded mt-2" @click="retrieve = true">Retrieve</button>
          </template>
        </div>
      </template>

      <template v-else>
        <div>
          Loading ...
        </div>
      </template>

      <div class="is-flex is-flex-direction-row is-justify-content-center">
        <amplify-sign-out>
        </amplify-sign-out>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { API, Auth } from 'aws-amplify';

interface AccountInfo {
  address: string;
  balance: string;
  privateKey: string;
}

@Component
export default class Account extends Vue {
  retrieve = false;

  username = '';
  account: AccountInfo | null = null;

  async mounted(): Promise<void> {
    const currentSession = await Auth.currentSession();
    this.username = currentSession.getAccessToken().payload.username;

    const res = await API.get('api', '/account', {});
    this.account = res;
  }
}
</script>
