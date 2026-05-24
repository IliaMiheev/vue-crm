<script setup lang="ts">
import UiMainContainer from '@/components/shared/UiMainContainer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useOrdersStore } from '@/stores/orders';
import { useCustomersStore } from '@/stores/customers';
import { useProductsStore } from '@/stores/products';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { formatToCurrencyString } from '@/utils/locales/format';
import { isApiSuccess, isCreateRoute, routeEntityId } from '@/utils/helpers/route-params';
import type { Product } from '@/types';

const route = useRoute();
const router = useRouter();
const orderStore = useOrdersStore();
const customerStore = useCustomersStore();
const productStore = useProductsStore();

const isCreateMode = isCreateRoute(route.params.id);
const title = ref(isCreateMode ? 'Новый заказ' : 'Редактирование заказа');
const formValid = ref(false);
const loading = ref(false);
const form = ref();
const selectedProductIds = ref<string[]>([]);

const DELIVERY_STATUS = ['packing', 'shipping', 'customs-clearance', 'delivered'];
const deliveryOptions = [
  { title: 'Упаковка', value: 'packing' },
  { title: 'Доставка', value: 'shipping' },
  { title: 'Таможня', value: 'customs-clearance' },
  { title: 'Доставлен', value: 'delivered' }
];

const { order, getStepVal } = storeToRefs(orderStore);
const { customers } = storeToRefs(customerStore);
const { products } = storeToRefs(productStore);

const customerOptions = computed(() =>
  customers.value.map((c) => ({
    title: c.fullname || `${c.firstname} ${c.lastname}`.trim(),
    value: c.fullname || `${c.firstname} ${c.lastname}`.trim()
  }))
);

const requiredRule = (value: unknown) => !!value || 'Обязательное поле';

if (isCreateMode) {
  orderStore.newOrder();
} else {
  orderStore.getOrderById(routeEntityId(route.params.id));
}

onMounted(async () => {
  if (!isCreateMode) return;
  await Promise.all([customerStore.getAll(), productStore.getAll()]);
});

watch(selectedProductIds, (ids) => {
  const items: Product[] = products.value.filter((p) => ids.includes(String(p.id)));
  order.value.lineItems = items.map((p) => ({ ...p }));
  order.value.amount = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
});

function onCancel() {
  orderStore.order = {} as typeof orderStore.order;
  router.replace({ path: '/order' });
}

async function submitCreate() {
  const { valid } = (await form.value?.validate()) ?? { valid: false };
  if (!valid) return;

  if (!order.value.lineItems?.length) {
    return;
  }

  loading.value = true;
  const results = await orderStore.saveOrder(order.value);
  if (isApiSuccess(results)) {
    router.replace({ path: '/order' });
  }
  loading.value = false;
}

async function submitAdvanceStatus(event: Event) {
  event.preventDefault();
  if (order.value.delivery === 'delivered') return;

  loading.value = true;
  const currentIdx = DELIVERY_STATUS.findIndex((s) => s === order.value.delivery);
  order.value.delivery = DELIVERY_STATUS[currentIdx + 1];

  const results = await orderStore.saveOrder(order.value);
  if (isApiSuccess(results)) {
    router.replace({ path: '/order' });
  }
  loading.value = false;
}
</script>

<template>
  <UiMainContainer>
    <UiParentCard :title="title">
      <div v-if="!orderStore.loading">
        <template v-if="isCreateMode">
          <v-form ref="form" v-model="formValid" @submit.prevent="submitCreate">
            <v-container>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="order.reference"
                    :rules="[requiredRule]"
                    label="№ заказа"
                    variant="solo-filled"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-autocomplete
                    v-model="order.customer"
                    :items="customerOptions"
                    item-title="title"
                    item-value="value"
                    :rules="[requiredRule]"
                    label="Клиент"
                    variant="solo-filled"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="order.delivery"
                    :items="deliveryOptions"
                    item-title="title"
                    item-value="value"
                    :rules="[requiredRule]"
                    label="Статус доставки"
                    variant="solo-filled"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-date-input
                    v-model="order.billingDate"
                    :rules="[requiredRule]"
                    label="Дата выставления счёта"
                    variant="solo-filled"
                    prepend-icon=""
                    prepend-inner-icon="$calendar"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-date-input
                    v-model="order.shippingDate"
                    :rules="[requiredRule]"
                    label="Дата отгрузки"
                    variant="solo-filled"
                    prepend-icon=""
                    prepend-inner-icon="$calendar"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    :model-value="order.amount"
                    label="Сумма (руб)"
                    variant="solo-filled"
                    readonly
                  />
                </v-col>
              </v-row>

              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1">Адрес доставки</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="order.shippingAddress.street"
                        :rules="[requiredRule]"
                        label="Улица"
                        variant="solo-filled"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="order.shippingAddress.city"
                        :rules="[requiredRule]"
                        label="Город"
                        variant="solo-filled"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="order.shippingAddress.country"
                        :rules="[requiredRule]"
                        label="Страна"
                        variant="solo-filled"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="order.shippingAddress.zipcode"
                        :rules="[requiredRule]"
                        label="Индекс"
                        variant="solo-filled"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1">Товары</v-card-title>
                <v-card-text>
                  <v-select
                    v-model="selectedProductIds"
                    :items="products"
                    item-title="name"
                    item-value="id"
                    label="Выберите товары"
                    variant="solo-filled"
                    multiple
                    chips
                    :rules="[(v: string[]) => (v?.length ? true : 'Добавьте хотя бы один товар')]"
                  />
                  <v-table v-if="order.lineItems?.length" density="compact" class="mt-4">
                    <thead>
                      <tr>
                        <th>Товар</th>
                        <th>Категория</th>
                        <th class="text-end">Цена</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in order.lineItems" :key="index">
                        <td>{{ item.name }}</td>
                        <td>{{ item.category }}</td>
                        <td class="text-end">{{ formatToCurrencyString(item.price) }} руб</td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
            </v-container>

            <v-row justify="end">
              <v-col cols="12" class="d-flex ga-4 justify-end">
                <v-btn color="primary" variant="outlined" @click="onCancel">Отменить</v-btn>
                <v-btn color="secondary" variant="flat" type="submit" :loading="loading">Создать заказ</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </template>

        <template v-else>
          <v-stepper v-model="getStepVal" class="mb-10">
            <v-stepper-header variant="flat">
              <v-stepper-item title="Упаковка" value="1" complete />
              <v-divider />
              <v-stepper-item title="Доставка" value="2" />
              <v-divider />
              <v-stepper-item title="Таможня" value="3" />
              <v-divider />
              <v-stepper-item title="Доставлен" value="4" />
            </v-stepper-header>
          </v-stepper>

          <v-divider />
          <v-form ref="form" v-model="formValid" @submit.prevent="submitAdvanceStatus">
            <v-container>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="order.reference"
                    label="№ заказа"
                    disabled
                    variant="solo-filled"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="order.customer" label="Клиент" disabled variant="solo-filled" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    :model-value="order.amount"
                    label="Сумма"
                    disabled
                    variant="solo-filled"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-date-input
                    v-model="order.billingDate"
                    label="Дата счёта"
                    disabled
                    variant="solo-filled"
                    prepend-icon=""
                    prepend-inner-icon="$calendar"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-date-input
                    v-model="order.shippingDate"
                    label="Дата отгрузки"
                    disabled
                    variant="solo-filled"
                    prepend-icon=""
                    prepend-inner-icon="$calendar"
                  />
                </v-col>
              </v-row>
            </v-container>

            <v-divider class="my-5" />

            <v-card variant="flat">
              <v-card-subtitle class="font-weight-bold">Адрес</v-card-subtitle>
              <v-card-text>
                <v-sheet rounded="0" border>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Улица</th>
                        <th>Город</th>
                        <th>Страна</th>
                        <th>Индекс</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{{ order.shippingAddress?.street }}</td>
                        <td>{{ order.shippingAddress?.city }}</td>
                        <td>{{ order.shippingAddress?.country }}</td>
                        <td>{{ order.shippingAddress?.zipcode }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-sheet>
              </v-card-text>
            </v-card>

            <v-divider class="my-5" />

            <v-card variant="flat">
              <v-card-subtitle class="font-weight-bold">Товары</v-card-subtitle>
              <v-card-text>
                <v-sheet border>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Наименование</th>
                        <th>Категория</th>
                        <th>Цена</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(lineItem, index) in order.lineItems" :key="index">
                        <td>
                          <v-img :src="lineItem.imageUri" width="48" height="48" cover />
                        </td>
                        <td>{{ lineItem.name }}</td>
                        <td>{{ lineItem.category }}</td>
                        <td>{{ formatToCurrencyString(lineItem.price) }} руб</td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-sheet>
              </v-card-text>
            </v-card>

            <v-divider class="my-5" />

            <v-row justify="end">
              <v-col cols="12" class="d-flex ga-4 justify-end">
                <v-btn color="primary" variant="outlined" @click="onCancel">Отменить</v-btn>
                <v-btn
                  :loading="loading"
                  :disabled="order.delivery === 'delivered'"
                  color="secondary"
                  variant="flat"
                  type="submit"
                >
                  {{ order.delivery === 'delivered' ? 'Завершён' : 'Следующий этап' }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </template>
      </div>
    </UiParentCard>
  </UiMainContainer>
</template>
