<script setup lang="ts">
import UiMainContainer from '@/components/shared/UiMainContainer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useCustomersStore } from '@/stores/customers';
import { formatMembership } from '@/utils/locales/labels';
import { routeEntityId } from '@/utils/helpers/route-params';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const AVATAR_PLACEHOLDER = 'assets/images/customer/avatar-0.webp';

function toPublicUrl(src?: string) {
  if (!src) return '';
  if (/^(?:\/|data:|blob:|https?:)/.test(src)) return src;
  return `/${src}`;
}

const route = useRoute();
const router = useRouter();
const customerStore = useCustomersStore();
customerStore.getCustomerById(routeEntityId(route.params.id));

const { customer } = storeToRefs(customerStore);
const avatarSrc = computed(() => toPublicUrl(customer.value.avatar) || toPublicUrl(AVATAR_PLACEHOLDER));

function onBack() {
  router.push({ path: '/customer' });
}

function onEdit() {
  router.push({ path: `/customer/${routeEntityId(route.params.id)}/edit` });
}
</script>

<template>
  <UiMainContainer>
    <UiParentCard title="Профиль покупателя">
      <div v-if="customerStore.loading">
        <v-progress-linear color="secondary" height="6" indeterminate rounded></v-progress-linear>
      </div>
      <div v-else>
        <div class="d-flex flex-column align-center mb-6">
          <v-avatar size="120">
            <v-img class="customer-avatar" :src="avatarSrc" alt="Фото покупателя" cover />
          </v-avatar>
          <div class="text-h5 mt-4">
            {{ customer.fullname || `${customer.firstname ?? ''} ${customer.lastname ?? ''}`.trim() }}
          </div>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Имя</div>
            <div class="text-body-1">{{ customer.firstname }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Фамилия</div>
            <div class="text-body-1">{{ customer.lastname }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Электронная почта</div>
            <div class="text-body-1">{{ customer.email }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Телефон</div>
            <div class="text-body-1">{{ customer.phone }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Дополнительный телефон</div>
            <div class="text-body-1">{{ customer.mobile }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Награды</div>
            <div class="text-body-1">{{ customer.rewards }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Членство</div>
            <div class="text-body-1">{{ formatMembership(customer.membership) }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Ожидаемые продажи</div>
            <v-icon
              v-if="customer.hasItemInShoppingCart"
              size="x-large"
              icon="$pendingShopping"
              color="error"
            ></v-icon>
            <div v-else class="text-body-1">Нет</div>
          </v-col>
        </v-row>

        <v-divider class="mt-4" />
        <v-row justify="end">
          <v-col cols="12" class="d-flex ga-6 mt-8 justify-end">
            <v-btn size="large" class="px-8" color="secondary" variant="flat" @click="onEdit">Изменить</v-btn>
            <v-btn size="large" class="px-8" color="primary" variant="outlined" @click="onBack">Назад</v-btn>
          </v-col>
        </v-row>
      </div>
    </UiParentCard>
  </UiMainContainer>
</template>
