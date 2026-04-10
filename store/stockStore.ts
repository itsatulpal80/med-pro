import { create } from "zustand";
import { stockApi } from "../services/api";
import type { ManualStockInput, Medicine, OCRResult } from "../utils/types";

type StockState = {
  items: Medicine[];
  loading: boolean;
  selectedOCRData: OCRResult | null;
  fetchStock: () => Promise<void>;
  fetchStockDetail: (id: string) => Promise<Medicine>;
  setOCRData: (data: OCRResult | null) => void;
  saveOCRData: (data: OCRResult) => Promise<void>;
  addManualStock: (data: ManualStockInput) => Promise<void>;
};

export const useStockStore = create<StockState>((set) => ({
  items: [],
  loading: false,
  selectedOCRData: null,

  fetchStock: async () => {
    set({ loading: true });
    try {
      const { data } = await stockApi.getStock();
      set({ items: data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchStockDetail: async (id) => {
    const { data } = await stockApi.getStockById(id);
    return data;
  },

  setOCRData: (data) => set({ selectedOCRData: data }),

  saveOCRData: async (data) => {
    await stockApi.saveFromOCR(data);
  },

  addManualStock: async (data) => {
    await stockApi.addManualStock(data);
  },
}));
