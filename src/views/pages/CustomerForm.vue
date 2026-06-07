<script setup lang="ts">
import UiMainContainer from '@/components/shared/UiMainContainer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useCustomersStore } from '@/stores/customers';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { isApiSuccess, isCreateRoute, routeEntityId } from '@/utils/helpers/route-params';
import { MAX_IMAGE_SIZE_MB, useImageUpload } from '@/composables/useImageUpload';
import { PhotoIcon } from 'vue-tabler-icons';
import { MEMBERSHIP_OPTIONS } from '@/utils/locales/labels';
import {
  formatRuPhone,
  RU_PHONE_MAX_LENGTH,
  RU_PHONE_PLACEHOLDER,
  ruPhoneRule
} from '@/utils/helpers/ru-phone';

const AVATAR_PLACEHOLDER = '/src/assets/images/customer/avatar-0.webp';

const route = useRoute();
const router = useRouter();
const title = ref('');
const valid = ref(false);
const loading = ref(false);
const form = ref();
const customerStore = useCustomersStore();

if (isCreateRoute(route.params.id)) {
  title.value = 'Новый покупатель';
  customerStore.newCustomer();
} else {
  title.value = 'Изменить данные покупателя';
  customerStore.getCustomerById(routeEntityId(route.params.id));
}

const { customer } = storeToRefs(customerStore);

const avatarUri = computed({
  get: () => customer.value.avatar,
  set: (value: string) => {
    customer.value.avatar = value;
  }
});

const { imageFile, imageError, previewImage, hasCustomImage, onImageSelected, removeImage } =
  useImageUpload(avatarUri, AVATAR_PLACEHOLDER);

const requiredRule = (value: unknown) => (value ? true : 'Это поле обязательно');
const nameRules = [requiredRule, (value: string) => (value?.length <= 20 ? true : 'Не более 20 символов')];
const emailRules = [
  requiredRule,
  (value: string) => (/.+@.+\..+/.test(value) ? true : 'Некорректный адрес почты')
];
const phoneRules = [requiredRule, ruPhoneRule];

function setPhoneField(field: 'phone' | 'mobile', value: string) {
  customer.value[field] = formatRuPhone(value);
}

watch(
  () => [customer.value.phone, customer.value.mobile] as const,
  ([phone, mobile]) => {
    if (phone) customer.value.phone = formatRuPhone(phone);
    if (mobile) customer.value.mobile = formatRuPhone(mobile);
  },
  { immediate: true }
);

function onCancel() {
  customerStore.customer = {} as typeof customerStore.customer;
  router.replace({ path: '/customer' });
}

async function submit(event: Event) {
  event.preventDefault();

  const { valid: isValid } = (await form.value?.validate()) ?? { valid: false };

  if (isValid) {
    loading.value = true;
    customer.value.fullname = `${customer.value.firstname} ${customer.value.lastname}`.trim();
    if (!customer.value.avatar) {
      customer.value.avatar = AVATAR_PLACEHOLDER;
    }
    const results = await customerStore.saveCustomer(customer.value);

    if (isApiSuccess(results)) {
      router.replace({ path: '/customer' });
    }
    loading.value = false;
  }
}
</script>

<template>
  <UiMainContainer>
    <UiParentCard :title="title">
      <div v-if="!customerStore.loading">
        <v-form ref="form" v-model="valid" @submit.prevent="submit">
          <v-container>
            <v-row justify="start">
              <v-col>
                <v-card variant="outlined" class="pa-4 text-center">
                  <v-avatar size="120" class="mb-4">
                    <v-img :src="previewImage" alt="Фото покупателя" cover />
                  </v-avatar>
                  <v-file-input
                    v-model="imageFile"
                    label="Загрузить фото"
                    accept="image/*"
                    variant="solo-filled"
                    show-size
                    clearable
                    hide-details="auto"
                    @update:model-value="onImageSelected"
                    @click:clear="removeImage"
                  >
                    <template #prepend-inner>
                      <PhotoIcon size="20" stroke-width="1.5" class="mr-1" />
                    </template>
                  </v-file-input>
                  <p v-if="imageError" class="text-error text-caption mt-2 mb-0">{{ imageError }}</p>
                  <p v-else class="text-caption text-medium-emphasis mt-2 mb-0">
                    JPG, PNG или WebP, до {{ MAX_IMAGE_SIZE_MB }} МБ
                  </p>
                  <v-btn
                    v-if="hasCustomImage"
                    class="mt-2"
                    variant="text"
                    color="error"
                    size="small"
                    @click="removeImage"
                  >
                    Удалить фото
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="customer.firstname"
                  :rules="nameRules"
                  label="Имя"
                  variant="solo-filled"
                  required
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="customer.lastname"
                  :rules="nameRules"
                  variant="solo-filled"
                  label="Фамилия"
                  required
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="customer.email"
                  :rules="emailRules"
                  label="Электронная почта"
                  variant="solo-filled"
                  required
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="customer.phone"
                  :rules="phoneRules"
                  label="Телефон"
                  :placeholder="RU_PHONE_PLACEHOLDER"
                  :maxlength="RU_PHONE_MAX_LENGTH"
                  inputmode="tel"
                  variant="solo-filled"
                  required
                  @update:model-value="setPhoneField('phone', $event)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="customer.mobile"
                  :rules="[ruPhoneRule]"
                  variant="solo-filled"
                  label="Дополнительный телефон"
                  :placeholder="RU_PHONE_PLACEHOLDER"
                  :maxlength="RU_PHONE_MAX_LENGTH"
                  inputmode="tel"
                  @update:model-value="setPhoneField('mobile', $event)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="customer.rewards"
                  type="number"
                  :rules="[requiredRule]"
                  label="Награды"
                  variant="solo-filled"
                  required
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="customer.membership"
                  clearable
                  label="Членство"
                  :rules="[requiredRule]"
                  :items="MEMBERSHIP_OPTIONS"
                  item-title="title"
                  item-value="value"
                  variant="solo-filled"
                />
              </v-col>
            </v-row>
          </v-container>
          <v-divider />
          <v-row justify="end">
            <v-col cols="12" class="d-flex ga-6 mt-8 justify-end">
              <v-btn
                :loading="loading"
                color="secondary"
                variant="flat"
                type="submit"
                size="large"
                class="px-8"
                @click="submit"
              >
                Подтвердить
              </v-btn>
              <v-btn
                size="large" 
                class="px-8" 
                color="primary" 
                variant="outlined" 
                @click="onCancel"
              >
                Отменить
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </UiParentCard>
  </UiMainContainer>
</template>
