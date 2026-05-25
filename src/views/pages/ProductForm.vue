<script setup lang="ts">
import UiMainContainer from '@/components/shared/UiMainContainer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useProductsStore } from '@/stores/products';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { Product } from '@/types';
import { isApiSuccess, isCreateRoute, routeEntityId } from '@/utils/helpers/route-params';
import { MAX_IMAGE_SIZE_MB, useImageUpload } from '@/composables/useImageUpload';
import { PhotoIcon } from 'vue-tabler-icons';

const AVATAR_PLACEHOLDER = '/src/assets/images/product/product-0.webp';

const route = useRoute();
const router = useRouter();
const title = ref('');
const valid = ref(false);
const loading = ref(false);
const form = ref();
const productStore = useProductsStore();

if (isCreateRoute(route.params.id)) {
    title.value = 'Новый товар';
    productStore.newProduct();
} else {
    title.value = 'Изменить информацию о товаре';
    productStore.getProductById(routeEntityId(route.params.id));
}

const { product } = storeToRefs(productStore);

const imageUri = computed({
  get: () => product.value.imageUri,
  set: (value: string) => {
    product.value.imageUri = value;
  }
});

const { imageFile, imageError, previewImage, hasCustomImage, onImageSelected, removeImage } =
  useImageUpload(imageUri, AVATAR_PLACEHOLDER);

const requiredRule = (value: any) => (value ? true : 'Эти поля обязательны для заполнения');
const postiveNumberRule = (value: any) => (value > 0 ? true : 'Это число должно быть больше чем ноль');
const nameRules = [requiredRule, (value: any) => (value?.length <= 30 ? true : 'Имя должно быть меньше 30 символов')];
const emailRules = [
    requiredRule,
    (value: any) => {
        if (/.+@.+\..+/.test(value)) return true;

        return 'Некорректный адрес почты';
    }
];

function onCancel() {
    if (productStore.product) productStore.product = {} as any;
    router.replace({ path: `/product` });
}

async function submit(event: any) {
    event.preventDefault();

    const { valid } = await form.value.validate();

    if (valid) {
        loading.value = true;
        const payload: Product = {
            ...product.value,
            price: Number(product.value.price),
            unitInStock: String(product.value.unitInStock)
        };
        if (!payload.imageUri) {
            payload.imageUri = AVATAR_PLACEHOLDER;
        }
        if (!payload.colors?.length) {
            payload.colors = ['#1890FF'] as unknown as [];
        }
        const results = await productStore.saveProduct(payload);

        if (isApiSuccess(results)) {
            router.replace({ path: '/product' });
        }
        loading.value = false;
    }
}
</script>

<template>
    <UiMainContainer>
        <UiParentCard :title="title">
            <div v-if="!productStore.loading">
                <v-form ref="form" v-model="valid" @submit.prevent>
                    <v-container>
                        <v-row justify="start">
                            <v-col>
                                <v-card variant="outlined" class="pa-4">
                                    <v-img
                                        :src="previewImage"
                                        alt="Фото товара"
                                        max-height="280"
                                        cover
                                        class="rounded-lg mb-4"
                                    />
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
                                    v-model="product.name"
                                    :rules="nameRules"
                                    label="Наименование товара"
                                    variant="solo-filled"
                                    required
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    type="number"
                                    v-model="product.unitInStock"
                                    :rules="[requiredRule]"
                                    variant="solo-filled"
                                    increment="1"
                                    label="Единиц на складе"
                                    required
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    type="number"
                                    v-model="product.price"
                                    :rules="[requiredRule, postiveNumberRule]"
                                    label="Цена за единицу"
                                    variant="solo-filled"
                                    required
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    type="number"
                                    v-model="product.retailPrice"
                                    :rules="[requiredRule]"
                                    label="Розничная цена"
                                    variant="solo-filled"
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-divider></v-divider>
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
                            <v-btn size="large" class="px-8" color="primary" variant="outlined" @click="onCancel">
                                Отменить
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </div>
        </UiParentCard>
    </UiMainContainer>
</template>
