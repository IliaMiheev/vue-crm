<script setup lang="ts">
import { computed } from 'vue';
import { LogoutIcon } from 'vue-tabler-icons';
import { useAuthStore } from '@/stores/auth';
import { getDisplayName, getRoleLabel } from '@/utils/helpers/user-role';

const authStore = useAuthStore();

const displayName = computed(() => getDisplayName(authStore.user));
const roleLabel = computed(() => getRoleLabel(authStore.user));
</script>

<template>
  <div class="pa-4">
    <h4 class="mb-n1">
      Привет, <span class="font-weight-regular">{{ displayName }}</span>
    </h4>
    <span class="text-subtitle-2 text-medium-emphasis">{{ roleLabel }}</span>

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
