<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const regForm = ref();
const checkbox = ref(false);
const show1 = ref(false);
const password = ref('');
const email = ref('');
const firstname = ref('');
const lastname = ref('');
const apiError = ref('');
const isSubmitting = ref(false);

const nameRules = [
  (v: string) => !!v?.trim() || 'Обязательное поле',
  (v: string) => (v?.trim().length >= 2) || 'Минимум 2 символа'
];

const emailRules = [
  (v: string) => !!v?.trim() || 'Укажите почту',
  (v: string) => /.+@.+\..+/.test(v) || 'Некорректный адрес почты'
];

const passwordRules = [
  (v: string) => !!v || 'Введите пароль',
  (v: string) => (v && v.length >= 6) || 'Минимум 6 символов',
  (v: string) => (v && v.length <= 32) || 'Не более 32 символов'
];

const agreementRules = [(v: boolean) => !!v || 'Необходимо принять правила сервиса'];

function formatApiError(error: unknown): string {
  if (typeof error === 'string') return error;
  return 'Не удалось зарегистрироваться';
}

async function onSubmit() {
  apiError.value = '';
  const { valid } = (await regForm.value?.validate()) ?? { valid: false };
  if (!valid) return;

  isSubmitting.value = true;
  try {
    await authStore.register({
      username: email.value.trim(),
      password: password.value,
      firstName: firstname.value.trim(),
      lastName: lastname.value.trim()
    });
  } catch (error) {
    apiError.value = formatApiError(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <v-form ref="regForm" class="mt-7 loginForm" @submit.prevent="onSubmit">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="firstname"
          :rules="nameRules"
          density="comfortable"
          hide-details="auto"
          variant="outlined"
          color="primary"
          label="Имя"
          required
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="lastname"
          :rules="nameRules"
          density="comfortable"
          hide-details="auto"
          variant="outlined"
          color="primary"
          label="Фамилия"
          required
        />
      </v-col>
    </v-row>

    <v-text-field
      v-model="email"
      :rules="emailRules"
      label="Почта"
      class="mt-4 mb-4"
      type="email"
      autocomplete="email"
      required
      density="comfortable"
      hide-details="auto"
      variant="outlined"
      color="primary"
    />

    <v-text-field
      v-model="password"
      :rules="passwordRules"
      label="Пароль"
      required
      density="comfortable"
      variant="outlined"
      color="primary"
      hide-details="auto"
      autocomplete="new-password"
      :append-icon="show1 ? '$eye' : '$eyeOff'"
      :type="show1 ? 'text' : 'password'"
      class="pwdInput"
      @click:append="show1 = !show1"
    />

    <div class="d-sm-inline-flex align-center mt-2 mb-2 font-weight-bold">
      <v-checkbox
        v-model="checkbox"
        :rules="agreementRules"
        label="Согласны с"
        required
        color="primary"
        class="ms-n2"
        hide-details="auto"
      />
      <a href="#" class="ml-1 text-lightText" @click.prevent>Правилами сервиса?</a>
    </div>

    <v-alert v-if="apiError" type="error" variant="tonal" class="mt-2 mb-2" density="compact">
      {{ apiError }}
    </v-alert>

    <v-btn
      color="secondary"
      block
      class="mt-2"
      variant="flat"
      size="large"
      type="submit"
      :loading="isSubmitting"
    >
      Зарегистрироваться
    </v-btn>
  </v-form>

  <div class="mt-5 text-right">
    <v-divider />
    <v-btn variant="plain" to="/login" class="mt-2 text-capitalize mr-n2">Уже есть аккаунт?</v-btn>
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
