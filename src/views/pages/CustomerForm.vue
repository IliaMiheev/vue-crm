<script setup lang="ts">
import UiMainContainer from '@/components/shared/UiMainContainer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useCustomersStore } from '@/stores/customers';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { isApiSuccess, isCreateRoute, routeEntityId } from '@/utils/helpers/route-params';

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

const requiredRule = (value: any) => (value ? true : 'Это поле обязательно');
const nameRules = [
    requiredRule,
    (value: any) => (value?.length <= 20 ? true : 'Не более 20 символов')
];
const emailRules = [
    requiredRule,
    (value: any) => {
        if (/.+@.+\..+/.test(value)) return true;

        return 'Некорректный адрес почты';
    }
];

function onCancel() {
    if (customerStore.customer) customerStore.customer = {} as any;
    router.replace({ path: `/customer` });
}

async function submit(event: any) {
    event.preventDefault();

    const { valid } = await form.value.validate();

    if (valid) {
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
                <v-form ref="form" v-model="valid" @submit.prevent>
                    <v-container>
                        <v-row justify="start">
                            <v-col cols="12" md="4">
                                <v-avatar size="120">
                                    <v-img alt="Avatar" v-if="customer.avatar" :src="customer.avatar"></v-img>
                                    <v-img alt="Avatar" v-if="!customer.avatar" :src="AVATAR_PLACEHOLDER"></v-img>
                                </v-avatar>
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
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    v-model="customer.lastname"
                                    :rules="nameRules"
                                    variant="solo-filled"
                                    label="Фамилия"
                                    required
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    v-model="customer.email"
                                    :rules="emailRules"
                                    label="E-mail"
                                    variant="solo-filled"
                                    required
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    v-model="customer.phone"
                                    :rules="[requiredRule]"
                                    label="Телефон"
                                    variant="solo-filled"
                                    required
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    v-model="customer.mobile"
                                    :rules="[requiredRule]"
                                    variant="solo-filled"
                                    label="Домашний телефон"
                                    required
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    type="number"
                                    v-model="customer.rewards"
                                    :rules="[requiredRule]"
                                    label="Награды"
                                    variant="solo-filled"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-select
                                    clearable
                                    label="Членство"
                                    v-model="customer.membership"
                                    :rules="[requiredRule]"
                                    :items="['standard', 'vip']"
                                    variant="solo-filled"
                                ></v-select>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-divider></v-divider>
                    <v-row justify="end">
                        <v-col cols="12" lg="2" md="6" sm="12" justify="end" class="">
                            <v-spacer></v-spacer>
                            <div class="d-flex ga-6 mt-8 justify-end">
                                <v-btn :loading="loading" color="secondary" variant="flat" type="submit" @click="submit"> Отправить </v-btn>

                                <v-btn @click="onCancel" color="primary" variant="outlined"> Отменить </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-form>
            </div>
        </UiParentCard>
    </UiMainContainer>
</template>
