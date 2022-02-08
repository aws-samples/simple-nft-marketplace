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
              <h4 class="title is-4 mb-0">Metadata</h4>
            </div>

            <div class="mb-1">
              <h6 class="title is-6 mb-0">Token ID</h6>
              <span>{{ tokenId }}</span>
            </div>

            <div class="mb-1">
              <h6 class="title is-6 mb-0">Title</h6>
              <span>{{ asset.title }}</span>
            </div>

            <div class="mb-1">
              <h6 class="title is-6 mb-0">Description</h6>
              <span>{{ asset.description }}</span>
            </div>

            <div class="mb-1">
              <h6 class="title is-6 mb-0">Owner</h6>
              <span>{{ item.owner }}</span>
            </div>

            <div class="mt-5 mb-3">
              <h4 class="title is-4 mb-0">Marketplace</h4>
            </div>

            <div class="mb-1">
              <h6 class="title is-6 mb-0">Listing</h6>
              <span>{{ item.marketplace.listing }}</span>
            </div>

            <div class="mb-1" v-if="item.marketplace.listing">
              <h6 class="title is-6 mb-0">Price</h6>
              <span>{{ priceEth(item.marketplace.price) }}</span>
            </div>

            <div class="mb-1">
              <h6 class="title is-6 mb-0">Publisher</h6>
              <span>{{ item.marketplace.publisher }}</span>
            </div>

            <div class="mb-1">
              <h6 class="title is-6 mb-0">Royalty (%)</h6>
              <span>{{ item.marketplace.royalty }}</span>
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

    <div class="mt-5 mb-5 has-text-centered has-text-weight-bold" v-if="message !== '' && message !== 'ERROR: {}'">
      <span>Do NOT close browser now. {{ message }}</span>
    </div>

    <section class="section" v-if="item && item.owned && !item.marketplace.listing">
      <h1 class="title">Marketplace</h1>
      <h3 class="subtitle is-6">
        You can set a price and sell your token.
      </h3>

      <div class="field">
        <label class="label">Price (ETH)</label>
        <div class="control">
          <input class="input" type="number" placeholder="0.001" v-model="price">
        </div>
      </div>

      <button :class="transactionButtonClass" @click="listOnMarketplace">
        Set price
      </button>
    </section>

    <section class="section" v-if="item && item.owned && item.marketplace.listing">
      <h1 class="title">Marketplace</h1>
      <h3 class="subtitle is-6">
        You can remove your token from marketplace.
      </h3>

      <button :class="transactionButtonClass" @click="removeFromMarketplace">
        Remove
      </button>
    </section>

    <section class="section" v-if="item && !item.owned && item.marketplace.listing">
      <h1 class="title">Purchase</h1>
      <h3 class="subtitle is-6">
        Price: {{ priceEth(item.marketplace.price) }} ETH
      </h3>

      <button :class="transactionButtonClass" @click="purchase">
        Purchase
      </button>
    </section>

    <section class="section" v-if="item && item.owned">
      <h1 class="title">Transfer</h1>
      <h3 class="subtitle is-6">
        You can transfer the ownership to another account.
      </h3>

      <div class="field">
        <label class="label">Address</label>
        <div class="control">
          <input class="input" type="text" placeholder="0x..." v-model="toAddress">
        </div>
      </div>

      <button :class="transactionButtonClass" @click="transfer" :disabled="transferButtonDisabled">
        Transfer
      </button>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { API } from 'aws-amplify';
import axios from 'axios';
import { pollJob } from '../lib/pollJob';

interface Marketplace {
  price: number;
  listing: boolean;
  publisher: string;
  royalty: number;
}

interface Item {
  tokenId: string;
  tokenUri: string;
  owner: string;
  owned: boolean;
  marketplace: Marketplace;
}

interface Asset {
  title: string;
  description: string;
  url: string;
}

@Component
export default class Show extends Vue {
  item: Item | null = null;
  asset: Asset | null = null;
  toAddress = '';
  txHash = '';
  message = '';
  pollingCounter = 0;
  price = 0.001;

  loading = false;
  executing = false;

  get tokenId(): number {
    return Number(this.$route.params.id);
  }

  async getItem(): Promise<Item> {
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

    await this.createNewTransaction(`/item/${this.tokenId}`, {
      toAddress: this.toAddress,
    });
  }

  async listOnMarketplace(): Promise<void> {
    await this.createNewTransaction(`/item/${this.tokenId}/list`, { price: this.price });
  }

  async removeFromMarketplace(): Promise<void> {
    await this.createNewTransaction(`/item/${this.tokenId}/unlist`, {});
  }

  async purchase(): Promise<void> {
    await this.createNewTransaction(`/item/${this.tokenId}/purchase`, {});
  }

  async mounted(): Promise<void> {
    this.loading = true;

    try {
      const res = await this.getItem();
      this.item = res;
      this.asset = await this.getAsset(res.tokenUri);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  get transactionButtonClass(): string {
    if (this.executing) {
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

  priceEth(priceWei: number): number {
    // eslint-disable-next-line
    const Web3 = require('web3');

    return Web3.utils.fromWei(priceWei, 'ether');
  }

  async createNewTransaction(path: string, body: { [key: string]: string|number }): Promise<void> {
    this.executing = true;

    try {
      this.message = `Create new transaction...`;

      const resJob = await API.post('api', path, { body });

      this.pollingCounter = 0;

      const jobId = resJob.jobId;

      await pollJob(jobId, (res) => {
        this.pollingCounter += 1;
        this.message = `Polling job... (Count: ${this.pollingCounter}, Current status: ${res.status})`;
      });

      this.message = 'Success! (Reloading the page in few seconds...)';
      this.executing = false;

      setTimeout(() => {
        this.$router.go(0);
      }, 1500);
    } catch (e) {
      this.message = `ERROR: ${JSON.stringify(e)}`;
    } finally {
      this.executing = false;
    }
  }
}
</script>
