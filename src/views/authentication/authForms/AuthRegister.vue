<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const checkbox = ref(false);
const show1 = ref(false);
const password = ref('password');
const email = ref('admin.test@test.com');
const Regform = ref();
const firstname = ref('Admin');
const lastname = ref('Test');
const passwordRules = ref([
  (v: string) => !!v || 'Password is required',
  (v: string) => (v && v.length <= 10) || 'Password must be less than 10 characters'
]);
const emailRules = ref([(v: string) => !!v || 'E-mail is required', (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid']);

function validate() {
  Regform.value.validate();
  const authStore = useAuthStore();
  return authStore.register(email.value, password.value);
}
</script>

<template>
  <v-form ref="Regform" action="/dashboard" class="mt-7 loginForm">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="firstname"
          density="comfortable"
          hide-details="auto"
          variant="outlined"
          color="primary"
          label="Имя"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="lastname"
          density="comfortable"
          hide-details="auto"
          variant="outlined"
          color="primary"
          label="Фамилия"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-text-field
      v-model="email"
      :rules="emailRules"
      label="Почта / Юзернейм"
      class="mt-4 mb-4"
      required
      density="comfortable"
      hide-details="auto"
      variant="outlined"
      color="primary"
    ></v-text-field>
    <v-text-field
      v-model="password"
      :rules="passwordRules"
      label="Пароль"
      required
      density="comfortable"
      variant="outlined"
      color="primary"
      hide-details="auto"
      :append-icon="show1 ? '$eye' : '$eyeOff'"
      :type="show1 ? 'text' : 'password'"
      @click:append="show1 = !show1"
      class="pwdInput"
    ></v-text-field>

    <div class="d-sm-inline-flex align-center mt-2 mb-7 mb-sm-0 font-weight-bold">
      <v-checkbox
        v-model="checkbox"
        :rules="[(v: any) => !!v || 'You must agree to continue!']"
        label="Согласны с"
        required
        color="primary"
        class="ms-n2"
        hide-details
      ></v-checkbox>
      <a href="#" class="ml-1 text-lightText">Правилами сервиса?</a>
    </div>
    <v-btn color="secondary" block class="mt-2" variant="flat" size="large" @click="validate()">Зарегистрироваться</v-btn>
  </v-form>
  <div class="mt-5 text-right">
    <v-divider />
    <v-btn variant="plain" to="/login" class="mt-2 text-capitalize mr-n2" type="submit">Уже есть аккаунт?</v-btn>
  </div>
</template>

<style lang="scss">
.pwdInput {
  position: relative;
  .v-input__append {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
