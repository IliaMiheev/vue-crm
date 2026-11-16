<script setup lang="ts">
import UiMainContainer from '@/components/shared/UiMainContainer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useProductsStore } from '@/stores/products';
import { formatToCurrencyString } from '@/utils/locales/format';
import { routeEntityId } from '@/utils/helpers/route-params';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const IMAGE_PLACEHOLDER = 'assets/images/product/product-0.webp';

function toPublicUrl(src?: string) {
  if (!src) return '';
  if (/^(?:\/|data:|blob:|https?:)/.test(src)) return src;
  return `/${src}`;
}

const route = useRoute();
const router = useRouter();
const productStore = useProductsStore();
productStore.getProductById(routeEntityId(route.params.id));

const { product } = storeToRefs(productStore);
const imageSrc = computed(() => toPublicUrl(product.value.imageUri) || toPublicUrl(IMAGE_PLACEHOLDER));

function onBack() {
  router.push({ path: '/product' });
}

function onEdit() {
  router.push({ path: `/product/${routeEntityId(route.params.id)}/edit` });
}
</script>

<template>
  <UiMainContainer>
    <UiParentCard title="Товар">
      <div v-if="productStore.loading">
        <v-progress-linear color="secondary" height="6" indeterminate rounded></v-progress-linear>
      </div>
      <div v-else>
        <v-img :src="imageSrc" alt="Фото товара" max-height="280" cover eager class="rounded-lg mb-6" />
        <div class="text-h5 mb-6">{{ product.name }}</div>

        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Категория</div>
            <div class="text-body-1">{{ product.category }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Единиц на складе</div>
            <div class="text-body-1">{{ product.unitInStock }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Цена за единицу</div>
            <div class="text-body-1">{{ formatToCurrencyString(product.price) }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Розничная цена</div>
            <div class="text-body-1">{{ formatToCurrencyString(product.retailPrice) }}</div>
          </v-col>
          <v-col cols="12">
            <div class="text-caption text-medium-emphasis">Цвета</div>
            <div class="d-flex flex-wrap ga-2 mt-2">
              <div
                v-for="(color, index) in product.colors"
                :key="index"
                class="product-color"
                :style="{ background: color }"
              ></div>
              <div v-if="!product.colors?.length" class="text-body-1">Нет</div>
            </div>
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

<style scoped>
.product-color {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: rgba(0, 0, 0, 0.24) -1px 1px 2px inset;
}
</style>
