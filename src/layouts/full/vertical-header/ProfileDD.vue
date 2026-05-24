<script setup lang="ts">
import { SettingsIcon, LogoutIcon } from 'vue-tabler-icons';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div class="pa-4">
    <h4 class="mb-n1">Привет, <span class="font-weight-regular">Admin</span></h4>
    <span class="text-subtitle-2 text-medium-emphasis">Администратор</span>

    <v-list>
      <v-list-item @click="authStore.logout()" color="secondary" rounded="md">
        <template v-slot:prepend>
          <LogoutIcon size="20" class="mr-2" />
        </template>
        <v-list-item-title class="text-subtitle-2">Выйти</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>
