<script setup lang="ts">
import UiMainContainer from '@/components/shared/UiMainContainer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useOrdersStore } from '@/stores/orders';
import { formatDeliveryStatus } from '@/utils/locales/labels';
import { formatRuShortDate, formatToCurrencyString } from '@/utils/locales/format';
import { routeEntityId } from '@/utils/helpers/route-params';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

function toPublicUrl(src?: string) {
  if (!src) return '';
  if (/^(?:\/|data:|blob:|https?:)/.test(src)) return src;
  return `/${src}`;
}

function deliveryColor(status: string | undefined): string {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'packing':
      return 'error';
    case 'customs-clearance':
      return 'info';
    case 'shipping':
      return 'warning';
    default:
      return '';
  }
}

const route = useRoute();
const router = useRouter();
const orderStore = useOrdersStore();
orderStore.getOrderById(routeEntityId(route.params.id));

const { order } = storeToRefs(orderStore);

function onBack() {
  router.push({ path: '/order' });
}

function onEdit() {
  router.push({ path: `/order/${routeEntityId(route.params.id)}/edit` });
}
</script>

<template>
  <UiMainContainer>
    <UiParentCard title="Заказ">
      <div v-if="orderStore.loading">
        <v-progress-linear color="secondary" height="6" indeterminate rounded></v-progress-linear>
      </div>
      <div v-else>
        <div class="text-h5 mb-6">{{ order.reference }}</div>

        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Клиент</div>
            <div class="text-body-1">{{ order.customer }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Сумма</div>
            <div class="text-body-1">{{ formatToCurrencyString(order.amount) }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Дата счёта</div>
            <div class="text-body-1">{{ formatRuShortDate(order.billingDate) }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Дата отгрузки</div>
            <div class="text-body-1">{{ formatRuShortDate(order.shippingDate) }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Доставка</div>
            <v-chip
              :border="`${deliveryColor(order.delivery)} thin opacity-10`"
              :color="deliveryColor(order.delivery)"
              :text="formatDeliveryStatus(order.delivery)"
              size="small"
              class="mt-1"
            ></v-chip>
          </v-col>
        </v-row>

        <div class="text-subtitle-1 mt-6 mb-2">Адрес доставки</div>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Улица</div>
            <div class="text-body-1">{{ order.shippingAddress?.street }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Город</div>
            <div class="text-body-1">{{ order.shippingAddress?.city }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Страна</div>
            <div class="text-body-1">{{ order.shippingAddress?.country }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Индекс</div>
            <div class="text-body-1">{{ order.shippingAddress?.zipcode }}</div>
          </v-col>
        </v-row>

        <div class="text-subtitle-1 mt-6 mb-2">Товары</div>
        <v-table density="compact">
          <thead>
            <tr>
              <th></th>
              <th>Наименование</th>
              <th>Категория</th>
              <th class="text-end">Цена</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lineItem, index) in order.lineItems" :key="index">
              <td>
                <v-img :src="toPublicUrl(lineItem.imageUri)" width="48" height="48" cover eager />
              </td>
              <td>{{ lineItem.name }}</td>
              <td>{{ lineItem.category }}</td>
              <td class="text-end">{{ formatToCurrencyString(lineItem.price) }}</td>
            </tr>
          </tbody>
        </v-table>

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
