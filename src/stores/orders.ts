import { defineStore } from 'pinia';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import type { Address, Order } from '@/types';

const baseUrl = `${import.meta.env.VITE_API_URL}/orders`;
const DELIVERY_STEPS = ['packing', 'shipping', 'customs-clearance', 'delivered'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useOrdersStore = defineStore('Orders', {
  state: () => ({
    orders: [] as Order[],
    loading: false,
    filter: '',
    order: {} as Order
  }),
  getters: {
    filteredData(): Order[] {
      return this.orders;
    },
    getStepVal(): string {
      const idx = DELIVERY_STEPS.findIndex((s) => s === this.order.delivery);
      return String(idx >= 0 ? idx + 1 : 1);
    }
  },
  actions: {
    async getAll() {
      this.loading = true;
      this.orders = await fetchWrapper.get(baseUrl);
      this.loading = false;
    },
    async deleteOrder(id: string) {
      const res = await fetchWrapper.delete(`${baseUrl}/${id}`);
      if (res.error) {
        console.log(res.error);
      }
      return res;
    },
    async getOrderById(id: string) {
      this.loading = true;
      this.order = await fetchWrapper.get(`${baseUrl}/${id}`);
      if (!this.order.shippingAddress) {
        this.order.shippingAddress = { street: '', city: '', country: '', zipcode: '' };
      }
      this.loading = false;
    },
    async saveOrder(order: Order) {
      if (order.id) {
        return fetchWrapper.put(`${baseUrl}/${order.id}`, order);
      }
      return fetchWrapper.post(`${baseUrl}`, order);
    },
    newOrder() {
      this.loading = true;
      this.order = {
        id: '',
        reference: `ORD-${Date.now()}`,
        customer: '',
        lineItems: [],
        amount: 0,
        billingDate: todayIso(),
        shippingDate: todayIso(),
        shippingAddress: {
          street: '',
          city: '',
          country: '',
          zipcode: ''
        } as Address,
        delivery: 'packing'
      };
      this.loading = false;
    }
  }
});
