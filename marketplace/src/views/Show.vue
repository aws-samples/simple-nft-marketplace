<template>
  <div>
    <section class="section">
      <h1 class="title">Show NFT</h1>

      <template v-if="loading">
        <div class="mt-4">
          Loading ...
        </div>
      </template>
      <template v-else-if="asset">
        <div class="columns">
          <div class="column">
            <div class="mb-3">
              <h6 class="title is-6 mb-0">Title</h6>
              <span>{{ asset.title }}</span>
            </div>

            <div class="mb-3">
              <h6 class="title is-6 mb-0">Description</h6>
              <span>{{ asset.description }}</span>
            </div>

            <div class="mb-3">
              <h6 class="title is-6 mb-0">Owner</h6>
              <span>{{ owner }}</span>
            </div>
          </div>

          <div class="column">
            <div class="is-flex is-flex-direction-row is-justify-content-center">
              <img :src="asset.url" width="500">
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="mt-4">
          No asset found
        </div>
      </template>
    </section>

    <section class="section" v-if="owned">
      <h1 class="title">Transfer</h1>
      <h3 class="subtitle is-6">
        You are the owner of this token. You can transfer the ownership to another account.
      </h3>

      <div class="field">
        <label class="label">Address</label>
        <div class="control">
          <input class="input" type="text" placeholder="0x..." v-model="toAddress">
        </div>
      </div>

      <button :class="transferButtonClass" @click="transfer" :disabled="transferButtonDisabled">
        Transfer
      </button>

      <div class="mt-5 has-text-centered has-text-weight-bold" v-if="message !== '' && message !== 'ERROR: {}'">
        <span>Do NOT close browser now. {{ message }}</span>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { API } from 'aws-amplify';
import axios from 'axios';
import { pollJob } from '../lib/pollJob';

interface ItemResponse {
  tokenId: string;
  tokenUri: string;
  owner: string;
  owned: boolean;
}

interface Asset {
  title: string;
  description: string;
  url: string;
}

@Component
export default class Show extends Vue {
  owner = '';
  owned = false;
  asset: Asset | null = null;
  toAddress = '';
  txHash = '';
  message = '';
  pollingCounter = 0;

  loading = false;
  transferring = false;

  get tokenId(): number {
    return Number(this.$route.params.id);
  }

  async getItem(): Promise<ItemResponse> {
    const res = await API.get('api', `/item/${this.tokenId}`, {});
    return res;
  }

  async getAsset(tokenUri: string): Promise<Asset> {
    const res = await axios.get(tokenUri);
    return res.data as Asset;
  }

  async transfer(): Promise<void> {
    if (this.toAddress === '') {
      return;
    }

    this.transferring = true;

    try {
      this.message = `Transferring to ${this.toAddress}...`;

      const resJob = await API.post('api', `/item/${this.tokenId}`, {
        body: {
          toAddress: this.toAddress,
          tokenId: this.tokenId,
        },
      });

      this.pollingCounter = 0;

      const jobId = resJob.jobId;
      const txHash = await pollJob(jobId, (res) => {
        this.pollingCounter += 1;
        this.message = `Polling job... (Count: ${this.pollingCounter}, Current status: ${res.status})`;
      });

      // eslint-disable-next-line
      this.txHash = txHash!;
      this.message = 'Success! (Reloading the page in few seconds...)';
      this.transferring = false;

      setTimeout(() => {
        this.$router.go(0);
      }, 1500);
    } catch (e) {
      this.message = `ERROR: ${JSON.stringify(e)}`;
    } finally {
      this.transferring = false;
    }
  }

  async mounted(): Promise<void> {
    this.loading = true;

    try {
      const res = await this.getItem();
      this.owner = res.owner;
      this.owned = res.owned;
      this.asset = await this.getAsset(res.tokenUri);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  get transferButtonClass(): string {
    if (this.transferring) {
      return 'button is-primary is-loading';
    } else {
      return 'button is-primary';
    }
  }

  get transferButtonDisabled(): boolean {
    if (this.toAddress === '') {
      return true;
    } else {
      return false;
    }
  }
}
</script>
