<template>
  <div>
    <section class="section">
      <h1 class="title">Create NFT</h1>
      <router-link class="button is-primary" :to="{ name: 'Create' }">Create NFT</router-link>
    </section>

    <section class="section">
      <h1 class="title">Show NFT</h1>

      <div class="is-flex is-flex-direction-row is-align-items-flex-end">
        <div class="field mb-0">
          <label class="label">Token ID</label>
          <div class="control">
            <input class="input" type="text" placeholder="Token ID" v-model="tokenId">
          </div>
        </div>

        <router-link class="button is-primary ml-2" :to="{ name: 'Show', params: { id: '1' } }">Show NFT</router-link>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Home extends Vue {
  tokenId = '';
}
</script>
