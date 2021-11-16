<template>
  <div>
    <amplify-authenticator :formFields="formFields">
      <amplify-sign-up :form-fields.prop="formFields" slot="sign-up">
      </amplify-sign-up>
    </amplify-authenticator>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { onAuthUIStateChange } from '@aws-amplify/ui-components';

@Component
export default class SignIn extends Vue {
  formFields = [
    { type: "username" },
    { type: "password" },
    { type: "email" }
  ];

  unsubscribeAuth: (() => void) | null = null;

  created(): void {
    this.unsubscribeAuth = onAuthUIStateChange((authState: string) => {
      if (authState === 'signedin') {
        this.$router.push({ name: 'Home' });
      }
    });
  }

  beforeDestroy(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }
}
</script>
