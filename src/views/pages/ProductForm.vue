<script setup lang="ts">
import UiMainContainer from '@/components/shared/UiMainContainer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useProductsStore } from '@/stores/products';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { Product } from '@/types';
import { isApiSuccess, isCreateRoute, routeEntityId } from '@/utils/helpers/route-params';
import { MAX_IMAGE_SIZE_MB, useImageUpload } from '@/composables/useImageUpload';
import { useProductColors } from '@/composables/useProductColors';
import { PhotoIcon, PlusIcon, XIcon } from 'vue-tabler-icons';

const AVATAR_PLACEHOLDER = 'assets/images/product/product-0.webp';

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
const colorsModel = computed({
    get: () => product.value.colors,
    set: (value: string[]) => {
        product.value.colors = value;
    }
});

const {
    productColors,
    ensureColors,
    addColor,
    updateColorFromPicker,
    removeColor,
    validateColors,
    normalizeAllColors,
    toPickerValue
} = useProductColors(colorsModel);

const colorsError = ref('');

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
const nameRules = [requiredRule, (value: any) => (value?.length <= 30 ? true : 'Имя/название должно быть меньше 30 символов')];

function onAddColorFromPicker(event: Event) {
    const input = event.target as HTMLInputElement;
    addColor(input.value);
    input.value = '#1890FF';
}

watch(
    () => product.value.colors,
    (colors) => {
        if (!colors?.length) ensureColors();
    },
    { immediate: true }
);

function onCancel() {
    if (productStore.product) productStore.product = {} as any;
    router.replace({ path: `/product` });
}

async function submit(event: any) {
    event.preventDefault();

    const { valid } = await form.value.validate();
    const colorsValidation = validateColors();
    colorsError.value = colorsValidation === true ? '' : colorsValidation;

    if (valid && colorsValidation === true) {
        loading.value = true;
        const payload: Product = {
            ...product.value,
            price: Number(product.value.price),
            unitInStock: String(product.value.unitInStock),
            colors: normalizeAllColors()
        };
        if (!payload.imageUri) {
            payload.imageUri = AVATAR_PLACEHOLDER;
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

                            <v-col cols="12" md="8" lg="6">
                                <div class="product-colors">
                                    <p class="text-subtitle-2 mb-3">Цвета товара</p>
                                    <div class="color-swatches">
                                        <div
                                            v-for="(color, index) in productColors"
                                            :key="index"
                                            class="color-swatch"
                                            :style="{ background: color }"
                                            :title="`Изменить цвет ${index + 1}`"
                                        >
                                            <input
                                                class="color-swatch__input"
                                                type="color"
                                                :value="toPickerValue(color)"
                                                :aria-label="`Изменить цвет ${index + 1}`"
                                                @change="updateColorFromPicker(index, $event)"
                                            />
                                            <button
                                                v-if="productColors.length > 1"
                                                type="button"
                                                class="color-swatch__remove"
                                                :aria-label="`Удалить цвет ${index + 1}`"
                                                @click="removeColor(index)"
                                            >
                                                <XIcon size="12" stroke-width="2" />
                                            </button>
                                        </div>

                                        <label class="color-swatch color-swatch--add" title="Добавить цвет">
                                            <PlusIcon size="20" stroke-width="1.5" />
                                            <input
                                                class="color-swatch__input"
                                                type="color"
                                                value="#1890FF"
                                                aria-label="Добавить цвет"
                                                @change="onAddColorFromPicker"
                                            />
                                        </label>
                                    </div>
                                    <p v-if="colorsError" class="text-error text-caption mt-2 mb-0">{{ colorsError }}</p>
                                </div>
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

<style scoped lang="scss">
.product-colors {
    padding: 0.25rem 0;
}

.color-swatches {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
}

.color-swatch {
    position: relative;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 2px solid rgb(var(--v-theme-surface));
    box-shadow:
        0 2px 6px rgba(0, 0, 0, 0.12),
        inset 0 0 0 1px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    flex-shrink: 0;

    &:hover {
        transform: scale(1.08);
        box-shadow:
            0 4px 10px rgba(0, 0, 0, 0.16),
            inset 0 0 0 1px rgba(0, 0, 0, 0.08);
        z-index: 1;
    }
}

.color-swatch__input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: none;
    padding: 0;
}

.color-swatch__remove {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgb(var(--v-theme-surface));
    background: rgb(var(--v-theme-error));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 2;
    cursor: pointer;
    padding: 0;
}

.color-swatch:hover .color-swatch__remove {
    opacity: 1;
}

.color-swatch--add {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--v-theme-primary), 0.04);
    border: 2px dashed rgba(var(--v-theme-primary), 0.35);
    color: rgb(var(--v-theme-primary));
    box-shadow: none;

    &:hover {
        background: rgba(var(--v-theme-primary), 0.08);
        border-color: rgba(var(--v-theme-primary), 0.55);
    }
}
</style>
