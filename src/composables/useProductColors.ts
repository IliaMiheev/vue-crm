import { computed, type Ref } from 'vue';

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;
const DEFAULT_COLOR = '#1890FF';

export function normalizeHexColor(value: string): string {
  let hex = value.trim();
  if (!hex) return '';
  if (!hex.startsWith('#')) hex = `#${hex}`;
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex.toUpperCase();
}

export function isValidHexColor(value: string): boolean {
  return HEX_REGEX.test(normalizeHexColor(value));
}

export function toPickerValue(hex: string): string {
  const normalized = normalizeHexColor(hex);
  return isValidHexColor(normalized) ? normalized : DEFAULT_COLOR;
}

export function useProductColors(colors: Ref<string[] | undefined>) {
  const productColors = computed(() => colors.value ?? []);

  function ensureColors() {
    if (!colors.value?.length) {
      colors.value = [DEFAULT_COLOR];
    }
  }

  function addColor(hex = DEFAULT_COLOR) {
    colors.value = [...productColors.value, normalizeHexColor(hex)];
  }

  function updateColor(index: number, value: string) {
    const list = [...productColors.value];
    list[index] = normalizeHexColor(value);
    colors.value = list;
  }

  function updateColorFromPicker(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    updateColor(index, value);
  }

  function removeColor(index: number) {
    const list = [...productColors.value];
    list.splice(index, 1);
    colors.value = list;
  }

  function validateColors(): string | true {
    if (!productColors.value.length) return 'Добавьте хотя бы один цвет';
    const invalid = productColors.value.find((color) => !isValidHexColor(color));
    if (invalid) return `Некорректный цвет: ${invalid}`;
    return true;
  }

  function normalizeAllColors(): string[] {
    return productColors.value.map((color) => normalizeHexColor(color));
  }

  return {
    productColors,
    ensureColors,
    addColor,
    updateColor,
    updateColorFromPicker,
    removeColor,
    validateColors,
    normalizeAllColors,
    isValidHexColor,
    normalizeHexColor,
    toPickerValue
  };
}
