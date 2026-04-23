<script setup>
const props = defineProps({
    dialog: false
})

defineEmits(['onConfirm', 'onCancel'])


</script>
<template>
    <div class="text-center pa-4">
      <v-dialog
        v-model="props.dialog"
        max-width="400"
        persistent
      >
  
        <v-card
          prepend-icon="mdi-map-marker"
          text="Вы действительно хотите удалить эту запись?"
          title="Подтвердите действие"
        >
          <template v-slot:actions>
            <v-spacer></v-spacer>
  
            <v-btn @click="$emit('onConfirm')" color="secondary" variant="plain">
              Подтвердить
            </v-btn>
  
            <v-btn @click="$emit('onCancel')" color="primary" variant="outlined">
              Отменить
            </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </template>