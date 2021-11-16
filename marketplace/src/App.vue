<template>
  <div>
    <nav class="navbar">
      <div class="navbar-menu">
        <div class="navbar-start">
          <router-link tag="a" class="navbar-item" :to="{ name: 'Home' }">
            Home
          </router-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <router-link tag="a" class="button is-primary" :to="{ name: 'Account' }">
                Account
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="container">
      <router-view/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class App extends Vue {
}
</script>

<style lang="scss">
</style>
