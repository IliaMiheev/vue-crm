<script setup lang="ts">
import { ref } from 'vue';
import { CopyIcon, FileExportIcon, DotsIcon, CircleArrowUpRightIcon } from 'vue-tabler-icons';
import iconCard from '@/assets/images/icons/icon-card.svg';

const earningsText = 'Общий доход: 500.000 рублей';
const snackbar = ref(false);
const snackbarText = ref('');

function showNotice(message: string) {
  snackbarText.value = message;
  snackbar.value = true;
}

async function copyEarnings() {
  try {
    await navigator.clipboard.writeText(earningsText);
    showNotice('Текст скопирован в буфер обмена');
  } catch {
    showNotice('Не удалось скопировать');
  }
}

function exportEarnings() {
  const blob = new Blob([earningsText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'общий-доход.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showNotice('Файл скачан');
}
</script>

<template>
  <v-card elevation="0" class="bg-secondary overflow-hidden bubble-shape bubble-secondary-shape">
    <v-card-text>
      <div class="d-flex align-start mb-6">
        <v-btn icon rounded="sm" color="darksecondary" variant="flat">
          <img :src="iconCard" width="25" alt="" />
        </v-btn>
        <div class="ml-auto z-1">
          <v-menu :close-on-content-click="true">
            <template v-slot:activator="{ props }">
              <v-btn icon rounded="sm" color="secondary" variant="flat" size="small" v-bind="props">
                <DotsIcon stroke-width="1.5" width="20" />
              </v-btn>
            </template>
            <v-sheet rounded="md" width="180" class="elevation-10">
              <v-list density="compact">
                <v-list-item @click="copyEarnings">
                  <template v-slot:prepend>
                    <CopyIcon stroke-width="1.5" size="20" />
                  </template>
                  <v-list-item-title class="ml-2">Копировать</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportEarnings">
                  <template v-slot:prepend>
                    <FileExportIcon stroke-width="1.5" size="20" />
                  </template>
                  <v-list-item-title class="ml-2">Экспортировать</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-menu>
        </div>
      </div>
      <h2 class="text-h1 font-weight-medium">
        500.000 рублей
        <a href="#"><CircleArrowUpRightIcon stroke-width="1.5" width="28" class="text-white" /></a>
      </h2>
      <span class="text-subtitle-1 text-medium-emphasis text-white">Общий доход</span>
    </v-card-text>

    <v-snackbar v-model="snackbar" :timeout="2500" color="secondary">
      {{ snackbarText }}
    </v-snackbar>
  </v-card>
</template>
