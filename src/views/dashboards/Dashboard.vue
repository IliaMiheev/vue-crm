<script setup lang="ts">
// imported components
import TotalEarning from './components/TotalEarning.vue';
import TotalOrder from './components/TotalOrder.vue';
import TotalIncome from './components/TotalIncome.vue';
import TotalGrowth from './components/TotalGrowth.vue';
import PopularStocks from './components/PopularStocks.vue';
import WidgetFive from './components/WidgetFive.vue';
import TransactionHistory from './components/TransactionHistory.vue';
import UniqueVisitor from './components/UniqueVisitor.vue';
import AnalyticsReport from './components/AnalyticsReport.vue';
import UiMainContainer from "@/components/shared/UiMainContainer.vue";
import UiParentCard from '@/components/shared/UiParentCard.vue';
</script>

<template>
<!--  <UiMainContainer>-->
    <UiParentCard title="Дашборд">
      <v-row>
        <!-- -------------------------------------------------------------------- -->
        <!-- Total Earning -->
        <!-- -------------------------------------------------------------------- -->
        <v-col cols="12" md="4">
          <TotalEarning />
        </v-col>
        <!-- -------------------------------------------------------------------- -->
        <!-- Total Order -->
        <!-- -------------------------------------------------------------------- -->
        <v-col cols="12" md="4">
          <TotalOrder />
        </v-col>
        <!-- -------------------------------------------------------------------- -->
        <!-- Total Income -->
        <!-- -------------------------------------------------------------------- -->
        <v-col cols="12" md="4">
          <TotalIncome />
        </v-col>

        <!-- -------------------------------------------------------------------- -->
        <!-- Total Growth -->
        <!-- -------------------------------------------------------------------- -->
        <v-col cols="12" lg="8">
          <TotalGrowth />
        </v-col>

        <!-- -------------------------------------------------------------------- -->
        <!-- Popular Stocks -->
        <!-- -------------------------------------------------------------------- -->
        <v-col cols="12" lg="4">
          <PopularStocks />
        </v-col>

        <!-- -------------------------------------------------------------------- -->
        <!-- Widgets -->
        <!-- -------------------------------------------------------------------- -->
      </v-row>
    </UiParentCard>
<!--  </UiMainContainer>-->
</template>
