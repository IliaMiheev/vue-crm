<script setup lang="ts">
import { ref, computed } from 'vue';
import ruLocale from 'apexcharts/dist/locales/ru.json';

interface PeriodItem {
  state: string;
  abbr: string;
}

interface PeriodData {
  total: string;
  categories: string[];
  series: { name: string; data: number[] }[];
}

const select = ref<PeriodItem>({ state: 'Сегодня', abbr: 'FL' });

const items: PeriodItem[] = [
  { state: 'Сегодня', abbr: 'FL' },
  { state: 'В этом месяце', abbr: 'GA' },
  { state: 'В этом году', abbr: 'NE' }
];

const periodData: Record<string, PeriodData> = {
  FL: {
    total: '124.50 рублей',
    categories: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    series: [
      { name: 'Инвестици', data: [5, 12, 8, 18, 22, 15, 10] },
      { name: 'Убыток', data: [2, 4, 3, 6, 5, 4, 3] },
      { name: 'Прибыль', data: [8, 15, 12, 25, 30, 20, 14] },
      { name: 'Обслуживание', data: [0, 0, 5, 0, 0, 8, 0] }
    ]
  },
  GA: {
    total: '2,324.00 рублей',
    categories: ['1', '5', '10', '15', '20', '25', '30'],
    series: [
      { name: 'Инвестици', data: [120, 95, 140, 110, 130, 105, 125] },
      { name: 'Убыток', data: [40, 35, 50, 45, 38, 42, 36] },
      { name: 'Прибыль', data: [200, 180, 220, 195, 210, 190, 205] },
      { name: 'Обслуживание', data: [0, 25, 0, 30, 0, 0, 40] }
    ]
  },
  NE: {
    total: '28,450.00 рублей',
    categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    series: [
      { name: 'Инвестици', data: [35, 125, 35, 35, 35, 80, 35, 20, 35, 45, 15, 75] },
      { name: 'Убыток', data: [35, 15, 15, 35, 65, 40, 80, 25, 15, 85, 25, 75] },
      { name: 'Прибыль', data: [35, 145, 35, 35, 20, 105, 100, 10, 65, 45, 30, 10] },
      { name: 'Обслуживание', data: [0, 0, 75, 0, 0, 115, 0, 0, 0, 0, 150, 0] }
    ]
  }
};

const currentData = computed(() => periodData[select.value.abbr] ?? periodData.FL);

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 480,
    fontFamily: 'inherit',
    foreColor: '#a1aab2',
    stacked: true,
    locales: [ruLocale],
    defaultLocale: 'ru'
  },
  colors: ['#FFDF40', '#B4F63D', '#E73A95', '#6C48D7'],
  responsive: [
    {
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }
  ],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '50%'
    }
  },
  xaxis: {
    type: 'category',
    categories: currentData.value.categories
  },
  legend: {
    show: true,
    fontFamily: `'Roboto', sans-serif`,
    position: 'bottom',
    offsetX: 20,
    labels: {
      useSeriesColors: false
    },
    markers: {
      width: 16,
      height: 16,
      radius: 5
    },
    itemMargin: {
      horizontal: 15,
      vertical: 8
    }
  },
  fill: {
    type: 'solid'
  },
  dataLabels: {
    enabled: false
  },
  grid: {
    show: true
  },
  tooltip: {
    theme: 'light'
  }
}));

const chartSeries = computed(() => currentData.value.series);
</script>

<template>
  <v-card elevation="0">
    <v-card variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="9">
            <span class="text-subtitle-2 text-disabled font-weight-bold">Общий рост</span>
            <h3 class="text-h3 mt-1">{{ currentData.total }}</h3>
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              color="primary"
              variant="outlined"
              hide-details
              v-model="select"
              :items="items"
              item-title="state"
              item-value="abbr"
              label="Период"
              return-object
              single-line
              :menu-props="{ minWidth: 220 }"
            />
          </v-col>
        </v-row>
        <div class="mt-4 total-growth-chart">
          <apexchart
            :key="select.abbr"
            type="bar"
            height="480"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<style scoped lang="scss">
.total-growth-chart {
  :deep(.apexcharts-toolbar) {
    max-width: none;
  }

  :deep(.apexcharts-menu) {
    min-width: 7rem;
    width: max-content;
  }

  :deep(.apexcharts-menu-item) {
    white-space: nowrap;
  }
}
</style>
