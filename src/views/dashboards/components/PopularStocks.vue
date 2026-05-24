<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon, DotsIcon } from 'vue-tabler-icons';

interface Revenue {
  name: string;
  price: number;
  profit: number;
}

interface PeriodData {
  featured: {
    name: string;
    profit: number;
    total: string;
  };
  chartSeries: { data: number[] }[];
  revenues: Revenue[];
  priceThreshold: number;
}

const periodOptions = [
  { value: '1', title: 'Сегодня' },
  { value: '2', title: 'В этом месяце' },
  { value: '3', title: 'В этом году' }
] as const;

const selectedPeriod = ref<string>('2');

const periodData: Record<string, PeriodData> = {
  '1': {
    featured: {
      name: 'Илья Банк',
      profit: 4,
      total: '12.450'
    },
    chartSeries: [{ data: [2, 8, 5, 12, 9, 11, 7] }],
    priceThreshold: 50,
    revenues: [
      { name: 'Илья Банк', price: 12.45, profit: 4 },
      { name: 'ТБАНК', price: 8.2, profit: 2 },
      { name: 'Альфа банк', price: 52.1, profit: 6 },
      { name: 'Сбер', price: 15.3, profit: 3 },
      { name: 'ВТБ', price: 9.8, profit: 1 }
    ]
  },
  '2': {
    featured: {
      name: 'Илья Банк',
      profit: 10,
      total: '1.839.000'
    },
    chartSeries: [{ data: [0, 15, 10, 50, 30, 40, 25] }],
    priceThreshold: 145,
    revenues: [
      { name: 'Илья Банк', price: 145.58, profit: 10 },
      { name: 'ТБАНК', price: 6.368, profit: 10 },
      { name: 'Альфа банк', price: 458.63, profit: 10 },
      { name: 'Сбер', price: 5.631, profit: 10 },
      { name: 'ВТБ', price: 6.368, profit: 10 }
    ]
  },
  '3': {
    featured: {
      name: 'Альфа банк',
      profit: 18,
      total: '24.680.000'
    },
    chartSeries: [{ data: [10, 25, 40, 55, 48, 62, 70, 65, 80, 75, 90, 95] }],
    priceThreshold: 1000,
    revenues: [
      { name: 'Илья Банк', price: 1845.2, profit: 12 },
      { name: 'ТБАНК', price: 920.5, profit: 8 },
      { name: 'Альфа банк', price: 2468.0, profit: 18 },
      { name: 'Сбер', price: 1560.3, profit: 14 },
      { name: 'ВТБ', price: 1102.7, profit: 9 }
    ]
  }
};

const currentData = computed(() => periodData[selectedPeriod.value] ?? periodData['2']);

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 95,
    fontFamily: 'inherit',
    foreColor: '#a1aab2',
    sparkline: {
      enabled: true
    }
  },
  colors: ['#5e35b1'],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 1
  },
  tooltip: {
    theme: 'light',
    fixed: {
      enabled: false
    },
    x: {
      show: false
    },
    y: {
      title: {
        formatter: () => 'Маржинальность '
      }
    },
    marker: {
      show: false
    }
  }
}));

const chartSeries = computed(() => currentData.value.chartSeries);

function isPriceUp(price: number) {
  return price > currentData.value.priceThreshold;
}

function selectPeriod(value: string) {
  selectedPeriod.value = value;
}
</script>

<template>
  <v-card elevation="0">
    <v-card variant="outlined">
      <v-card-text>
        <div class="d-flex align-center">
          <h4 class="text-h4 mt-1">Популярные акции</h4>
          <div class="ml-auto">
            <v-menu transition="slide-y-transition" :close-on-content-click="true">
              <template v-slot:activator="{ props }">
                <v-btn color="primary" size="small" icon rounded="sm" variant="text" v-bind="props">
                  <DotsIcon stroke-width="1.5" width="25" />
                </v-btn>
              </template>
              <v-sheet rounded="md" width="180" class="elevation-10">
                <v-list density="compact">
                  <v-list-item
                    v-for="option in periodOptions"
                    :key="option.value"
                    :value="option.value"
                    :active="selectedPeriod === option.value"
                    @click="selectPeriod(option.value)"
                  >
                    <v-list-item-title>{{ option.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-sheet>
            </v-menu>
          </div>
        </div>

        <v-card class="bg-lightsecondary mt-5">
          <div class="pa-5">
            <div class="d-flex align-start justify-space-between">
              <div>
                <h6 class="text-secondary text-h5">{{ currentData.featured.name }}</h6>
                <span class="text-subtitle-2 text-medium-emphasis font-weight-bold">
                  {{ currentData.featured.profit }}% прибыли
                </span>
              </div>
              <h4 class="text-h4">{{ currentData.featured.total }}</h4>
            </div>
          </div>
          <apexchart
            :key="selectedPeriod"
            type="area"
            height="95"
            :options="chartOptions"
            :series="chartSeries"
          />
        </v-card>

        <div class="mt-4">
          <v-list lines="two" class="py-0">
            <v-list-item
              v-for="(revenue, i) in currentData.revenues"
              :key="`${selectedPeriod}-${i}`"
              :value="revenue"
              color="secondary"
              rounded="sm"
            >
              <template v-slot:append>
                <div
                  v-if="isPriceUp(revenue.price)"
                  class="bg-lightsuccess rounded-sm d-flex align-center justify-center ml-3"
                  style="width: 20px; height: 20px"
                >
                  <ChevronUpIcon stroke-width="1.5" width="20" class="text-success" />
                </div>
                <div
                  v-else
                  class="bg-lighterror rounded-sm d-flex align-center justify-center ml-3"
                  style="width: 20px; height: 20px"
                >
                  <ChevronDownIcon stroke-width="1.5" width="20" class="text-error" />
                </div>
              </template>
              <div class="d-inline-flex align-center justify-space-between w-100">
                <div>
                  <h6 class="text-subtitle-1 text-medium-emphasis font-weight-bold">
                    {{ revenue.name }}
                  </h6>
                  <span v-if="isPriceUp(revenue.price)" class="text-success text-subtitle-2">{{ revenue.profit }}% прибыли</span>
                  <span v-else class="text-error text-subtitle-2">{{ revenue.profit }}% прибыли</span>
                </div>
                <div class="ml-auto text-subtitle-1 text-medium-emphasis font-weight-bold">{{ revenue.price }} руб</div>
              </div>
            </v-list-item>
          </v-list>

          <div class="text-center mt-3">
            <v-btn color="primary" variant="text">
              Смотреть все
              <template v-slot:append>
                <ChevronRightIcon stroke-width="1.5" width="20" />
              </template>
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-card>
</template>
