<script setup lang="ts">
import { ref } from 'vue';
import { BuildingStoreIcon, SendIcon, MailboxIcon, PhotoIcon } from 'vue-tabler-icons';

const notificationDD = ref(['Все уведомления', 'Новые', 'Непрочитанные', 'Прочие']);
const selectNotify = ref<string>('Все уведомления');
</script>

<template>
  <div class="pa-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <h6 class="text-subtitle-1">
        Все уведомления
        <v-chip color="warning" variant="flat" size="small" class="ml-2 text-white">01</v-chip>
      </h6>
      <a href="#" class="text-decoration-underline text-primary text-subtitle-2">Отметить все как прочитанные</a>
    </div>
    <v-select :items="notificationDD" v-model="selectNotify" color="primary" variant="outlined" density="default" hide-details></v-select>
  </div>
  <v-divider></v-divider>

  <v-list class="py-0" lines="three">
    <v-list-item value="" color="secondary" class="no-spacer">
      <template v-slot:prepend>
        <v-avatar size="40" class="mr-3 py-2">
          <img src="@/assets/images/profile/user-round.svg" width="40" alt="Профиль" />
        </v-avatar>
      </template>
      <div class="d-inline-flex align-center justify-space-between w-100">
        <h6 class="text-subtitle-1 font-weight-regular">Иван Петров</h6>
        <span class="text-subtitle-2 text-medium-emphasis">2 мин назад</span>
      </div>

      <p class="text-subtitle-2 text-medium-emphasis mt-1">Новое сообщение по заказу требует вашего внимания</p>
      <div class="mt-3">
        <v-chip size="small" text="Непрочитано" color="error" variant="tonal" class="mr-2" />
        <v-chip size="small" text="Новое" color="warning" variant="tonal" />
      </div>
    </v-list-item>
    <v-divider></v-divider>
    <v-list-item value="" color="secondary" class="no-spacer">
      <template v-slot:prepend>
        <v-avatar size="40" variant="flat" color="lightsuccess" class="mr-3 py-2 text-success">
          <BuildingStoreIcon size="20" />
        </v-avatar>
      </template>
      <div class="d-inline-flex align-center justify-space-between w-100">
        <h6 class="text-subtitle-1">Проверка магазина завершена</h6>
        <span class="text-subtitle-2 text-medium-emphasis">2 мин назад</span>
      </div>

      <p class="text-subtitle-2 text-medium-emphasis mt-1">Мы успешно получили вашу заявку.</p>
      <div class="mt-3">
        <v-chip size="small" color="error" text="Непрочитано" variant="tonal" />
      </div>
    </v-list-item>
    <v-divider></v-divider>
    <v-list-item value="" color="secondary" class="no-spacer">
      <template v-slot:prepend>
        <v-avatar size="40" variant="flat" color="lightprimary" class="mr-3 py-2 text-primary">
          <MailboxIcon size="20" />
        </v-avatar>
      </template>
      <div class="d-inline-flex align-center justify-space-between w-100">
        <h6 class="text-subtitle-1">Проверьте почту</h6>
        <span class="text-subtitle-2 text-medium-emphasis">2 мин назад</span>
      </div>

      <p class="text-subtitle-2 text-medium-emphasis mt-1">Готово! Загляните во входящие — там вас ждёт письмо.</p>
      <div class="mt-3">
        <v-btn color="primary" variant="flat">
          <template v-slot:append>
            <SendIcon size="20" />
          </template>
          Почта
        </v-btn>
      </div>
    </v-list-item>
    <v-divider></v-divider>
    <v-list-item value="" color="secondary" class="no-spacer">
      <template v-slot:prepend>
        <v-avatar size="40" class="mr-3 py-2">
          <img src="@/assets/images/profile/user-round.svg" width="40" alt="Профиль" />
        </v-avatar>
      </template>
      <div class="d-inline-flex align-center justify-space-between w-100">
        <h6 class="text-subtitle-1">Иван Петров</h6>
        <span class="text-subtitle-2 text-medium-emphasis">2 мин назад</span>
      </div>

      <p class="text-subtitle-2 mt-1">
        <span class="text-medium-emphasis">Загружено 2 файла </span>
        <span class="font-weight-medium">21 янв 2020</span>
      </p>
      <div class="mt-3 bg-lightsecondary rounded pa-5 d-flex align-center">
        <PhotoIcon size="20" stroke-width="1.5" />
        <span class="ml-2 text-subtitle-1">demo.jpg</span>
      </div>
    </v-list-item>
    <v-divider></v-divider>
    <v-list-item value="" color="secondary" class="no-spacer">
      <template v-slot:prepend>
        <v-avatar size="40" class="mr-3 py-2">
          <img src="@/assets/images/profile/user-round.svg" width="40" alt="Профиль" />
        </v-avatar>
      </template>
      <div class="d-inline-flex align-center justify-space-between w-100">
        <h6 class="text-subtitle-1">Иван Петров</h6>
        <span class="text-subtitle-2 text-medium-emphasis">2 мин назад</span>
      </div>

      <p class="text-subtitle-2 mt-1 text-medium-emphasis mb-3">Подтверждение учётной записи</p>
      <v-chip size="small" color="success" text="Аккаунт подтверждён" />
    </v-list-item>
  </v-list>
  <v-divider></v-divider>
  <div class="pa-2 text-center">
    <v-btn color="primary" variant="text">Смотреть все</v-btn>
  </div>
</template>
