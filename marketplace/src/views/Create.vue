<template>
  <div>
    <section class="section">
      <h1 class="title">Create NFT</h1>

      <h6 class="title is-6 mb-3">Select image file</h6>

      <template v-if="!uploading">
        <div class="file is-boxed mb-4" v-if="assetUrl === ''">
          <label class="file-label">
            <input class="file-input" type="file" accept="image/png, image/gif, image/jpeg" @change="uploadFile">
            <span class="file-cta">
              <span class="file-label">
                Choose a file…
              </span>
            </span>
          </label>
        </div>

        <div class="mb-4" v-else>
          Upload completed!
          <button class="button is-info is-small ml-2" @click="removeFile">Cancel</button>
        </div>
      </template>

      <template v-else>
        <div class="mb-4">
          Uploading ...
        </div>
      </template>

      <div class="field">
        <label class="label">Title</label>
        <div class="control">
          <input class="input" type="text" placeholder="Your NFT title" v-model="title">
        </div>
      </div>

      <div class="field">
        <label class="label">Description</label>
        <div class="control">
          <textarea class="textarea" placeholder="Description" v-model="description"></textarea>
        </div>
      </div>

      <div class="field">
        <label class="label">Royalty Percentage</label>
        <div class="control">
          <input class="input" type="number" placeholder="Royalty Percentage (e.g. 2)" v-model="royalty">
        </div>
      </div>

      <div class="is-flex is-flex-direction-row is-justify-content-center mt-5">
        <button :class="createButtonClass" @click="createNft" :disabled="createButtonDisabled">CREATE</button>
      </div>

      <div class="mt-5 has-text-centered has-text-weight-bold" v-if="message !== ''">
        <span>{{ message }}</span>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { API } from 'aws-amplify';
import axios from 'axios';
import { pollJob } from '../lib/pollJob';

interface CreateItemJob {
  txHash: string;
  tokenId: string;
  tokenUri: string;
}

@Component
export default class Create extends Vue {
  assetUrl = '';
  title = '';
  description = '';
  message = '';
  pollingCounter = 0;
  royalty = 5;

  uploading = false;
  creating = false;

  // eslint-disable-next-line
  async uploadFile(event: any): Promise<void> {
    if (event.target.files.length === 0) {
      return;
    }

    this.uploading = true;

    const file = event.target.files[0];
    const res = await API.get('api', '/upload', {});

    await axios.put(res.uploadUrl, file, { headers: { 'Content-Type': file.type } });

    this.assetUrl = res.assetUrl;
    this.uploading = false;
  }

  removeFile(): void {
    this.assetUrl = '';
  }

  async createNft(): Promise<void> {
    if (!Number.isInteger(this.royalty)) {
      this.message = 'Royalty must be integer (e.g. 5)';
      return;
    }

    this.creating = true;
    this.message = 'Creating asset...';

    try {
      const resAsset = await API.post('api', '/assets', {
        body: {
          title: this.title,
          description: this.description,
          url: this.assetUrl,
        },
      });
      const assetMetadataUrl = resAsset.assetMetadataUrl;

      this.message = 'Do NOT close browser now. Creating NFT...';

      const resItem = await API.post('api', '/item', {
        body: {
          assetMetadataUrl,
          royalty: this.royalty,
        },
      });

      this.pollingCounter = 0;

      const jobId = resItem.jobId;
      const resJob = await pollJob(jobId, (res) => {
        this.pollingCounter += 1;
        this.message = `Do NOT close browser now. Polling job... (Count: ${this.pollingCounter}, Current status: ${res.status})`;
      });

      // eslint-disable-next-line
      const resJobParsed: CreateItemJob = JSON.parse(resJob!);

      this.message = 'Success!';
      this.creating = false;

      setTimeout(() => {
        this.$router.push({
          name: 'Show',
          params: {
            id: resJobParsed.tokenId,
          },
        });
      }, 1000);
    } catch (e) {
      this.message = `ERROR: ${JSON.stringify(e)}`;
    } finally {
      this.creating = false;
    }
  }

  get createButtonClass(): string {
    if (this.creating) {
      return 'button is-medium is-primary is-loading';
    } else {
      return 'button is-medium is-primary';
    }
  }

  get createButtonDisabled(): boolean {
    if (
      (this.title !== '' &&
       this.description !== '' &&
       this.assetUrl !== null &&
       this.assetUrl !== ''
      ) && !this.creating) {
      return false;
    } else {
      return true;
    }
  }
}
</script>
