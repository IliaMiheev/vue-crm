<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Form } from 'vee-validate';

const checkbox = ref(false);
const valid = ref(false);
const show1 = ref(false);
const password = ref('password');
const username = ref('admin@test.com');
const passwordRules = ref([
  (v: string) => !!v || 'Введите пароль',
  (v: string) => (v && v.length <= 32) || 'Не более 32 символов'
]);
const emailRules = ref([
  (v: string) => !!v || 'Укажите почту',
  (v: string) => /.+@.+\..+/.test(v) || 'Некорректный адрес почты'
]);

/* eslint-disable @typescript-eslint/no-explicit-any */
function validate(values: any, { setErrors }: any) {
  const authStore = useAuthStore();
  return authStore.login(username.value, password.value).catch((error) => setErrors({ apiError: error }));
}
</script>

<template>
  <Form @submit="validate" class="mt-7 loginForm" v-slot="{ errors, isSubmitting }">
    <v-text-field
      v-model="username"
      :rules="emailRules"
      label="Почта / Юзернейм"
      class="mt-4 mb-8"
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

    <div class="d-sm-flex align-center mt-2 mb-7 mb-sm-0">
      <v-checkbox
        v-model="checkbox"
        :rules="[(v: any) => !!v || 'Отметьте, чтобы продолжить']"
        label="Запомнить на устройстве"
        required
        color="primary"
        class="ms-n2"
        hide-details
      ></v-checkbox>

    </div>
    <v-btn color="secondary" :loading="isSubmitting" block class="mt-2" variant="flat" size="large" :disabled="valid" type="submit">
      Войти</v-btn
    >
    <div v-if="errors.apiError" class="mt-2">
      <v-alert color="error">{{ errors.apiError }}</v-alert>
    </div>
  </Form>
  <div class="mt-5 text-right">
    <v-divider />
    <v-btn variant="plain" to="/register" class="mt-2 text-capitalize mr-n2">Нет аккаунта?</v-btn>
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
.loginForm {
  .v-text-field .v-field--active input {
    font-weight: 500;
  }
}
</style>
