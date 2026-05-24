import { computed, ref, type Ref } from 'vue';

export const MAX_IMAGE_SIZE_MB = 2;

export function useImageUpload(imageUri: Ref<string | undefined>, placeholder: string) {
  const imageFile = ref<File[]>([]);
  const imageError = ref('');

  const previewImage = computed(() => imageUri.value || placeholder);
  const hasCustomImage = computed(() => !!imageUri.value);

  function onImageSelected(files: File | File[] | null) {
    imageError.value = '';
    if (!files || (Array.isArray(files) && !files.length)) return;

    const file = Array.isArray(files) ? files[0] : files;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      imageError.value = 'Выберите файл изображения (JPG, PNG, WebP и т.д.)';
      imageFile.value = [];
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      imageError.value = `Размер файла не должен превышать ${MAX_IMAGE_SIZE_MB} МБ`;
      imageFile.value = [];
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      imageUri.value = String(reader.result);
    };
    reader.onerror = () => {
      imageError.value = 'Не удалось прочитать файл';
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    imageFile.value = [];
    imageError.value = '';
    imageUri.value = '';
  }

  return {
    imageFile,
    imageError,
    previewImage,
    hasCustomImage,
    onImageSelected,
    removeImage
  };
}
