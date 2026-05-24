<script setup lang="ts">
import { useProductsStore } from '@/stores/products';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { storeToRefs } from 'pinia';
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue';
import NotificationBar from '@/components/shared/NotificeBar.vue';
import { router } from '@/router';
import { ref } from 'vue';
import { isApiSuccess } from '@/utils/helpers/route-params';

const productStore = useProductsStore();
productStore.getAll();
const { filteredData, filter, totalPages, currentPage, totalCount } = storeToRefs(productStore);
const dialog = ref(false);
const notice = ref(false);
const selectedId = ref('');

function editProduct(id: string) {
  router.replace({ path: `/product/${id}` });
}

function deleteProduct(id: string) {
  dialog.value = true;
  selectedId.value = id;
}

function onConfirm() {
  if (selectedId.value) {
    productStore
      .deleteProduct(selectedId.value)
      .then((res) => {
        dialog.value = false;
        if (isApiSuccess(res)) {
          notice.value = true;
          setTimeout(() => {
            notice.value = false;
            productStore.getAll();
          }, 1000);
        }
      })
      .finally(() => (selectedId.value = ''));
  }
}

function onCancel() {
  dialog.value = false;
}

function onClose() {
  notice.value = false;
}

function onCreate() {
  router.replace({ path: '/product/new' });
}
</script>

<template>
  <UiParentCard title="Товары" :createFn="onCreate">
    <div v-if="productStore.loading">
      <v-progress-linear color="secondary" height="6" indeterminate rounded></v-progress-linear>
    </div>
    <div v-if="!productStore.loading">
      <v-text-field v-model="filter" variant="solo-filled" class="pa-2" label="Фильтровать"></v-text-field>

      <v-divider class="mb-10" />
      <v-row>
        <v-col cols="12" md="4" sm="6" v-for="(product, index) in filteredData" :key="index">
          <v-card variant="elevated" class="mx-auto ma-5" max-width="360">
            <v-img class="product-img align-end text-primary b-r-25" height="250" :src="product.imageUri" cover> </v-img>
            <v-card-title class="text-h3"> {{ product.name }} </v-card-title>

            <v-card-text class="d-flex justify-space-between">
              <div class="ml-0 text-h4 price">{{ product.price }} руб</div>
              <div class="chips">
                <div
                  class="chip"
                  v-for="(col, idx) in product.colors"
                  :style="'background:' + col"
                  :key="idx"
                ></div>
              </div>
            </v-card-text>

            <v-card-actions class="d-flex justify-end">
              <v-btn
                color="secondary mb-0"
                variant="outlined"
                text="Изменить"
                size="small"
                @click="editProduct(product.id)"
              ></v-btn>
              <v-btn
                color="primary"
                variant="plain"
                text="Удалить"
                size="large"
                @click="deleteProduct(product.id)"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" lg="12" class="d-flex justify-center">
          <v-chip class="text-h5" color="primary"> Всего: {{ totalCount }}</v-chip>
        </v-col>
      </v-row>
      <v-divider class="my-5" />

      <v-pagination v-model="currentPage" :length="totalPages" rounded="circle"></v-pagination>
    </div>
  </UiParentCard>
  <ConfirmDialog :dialog="dialog" @onConfirm="onConfirm" @onCancel="onCancel" />
  <NotificationBar :notice="notice" @onClose="onClose" />
</template>

<style lang="scss">
.product-img {
  border-top-left-radius: 5%;
  border-top-right-radius: 5%;
}

.price {
  color: rgb(226, 163, 45);
}

.chips {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-left: 1rem;
}

.chip {
  margin-left: calc(-0.75 * var(8px));
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.24) -1px 1px 2px inset;
}
</style>
