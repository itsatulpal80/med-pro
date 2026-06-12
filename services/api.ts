import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { API_BASE_URL } from "../utils/config";
import type {
  AuthResponse,
  DashboardResponse,
  ManualStockInput,
  Medicine,
  OCRResult,
} from "../utils/types";

const TOKEN_KEY = "medstock_token";
const USER_KEY = "medstock_user";

async function clearAuthStorage() {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
    globalThis.localStorage?.removeItem(USER_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token =
    Platform.OS === "web"
      ? globalThis.localStorage?.getItem(TOKEN_KEY)
      : await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearAuthStorage();
    }
    return Promise.reject(error);
  },
);

type BackendMedicine = {
  _id: string;
  name: string;
  distributor: string;
  totalQuantity: number;
  batches?: Array<{
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    purchaseRate: number;
    mrp: number;
  }>;
};

type BackendOCRResponse = {
  data: {
    supplierName: string;
    invoiceNumber: string;
    invoiceDate: string;
    items: Array<{
      name: string;
      distributor?: string;
      batchNumber: string;
      expiryDate: string;
      quantity: number;
      purchaseRate: number;
      mrp: number;
    }>;
  };
};

const mapMedicine = (item: BackendMedicine): Medicine => {
  const batches = item.batches || [];
  const nearestExpiry = batches
    .map((b) => b.expiryDate)
    .filter(Boolean)
    .sort()[0];

  return {
    id: item._id,
    name: item.name,
    distributor: item.distributor,
    quantity: item.totalQuantity ?? 0,
    expiry: nearestExpiry || "",
    batches: batches.map((b) => ({
      batchNumber: b.batchNumber,
      expiry: b.expiryDate,
      expiryDate: b.expiryDate,
      quantity: b.quantity,
      purchaseRate: b.purchaseRate,
      mrp: b.mrp,
    })),
  };
};

export const authApi = {
  login: (mobile: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { mobile, password }),
  register: (name: string, mobile: string, password: string) =>
    api.post<AuthResponse>("/auth/register", { name, mobile, password }),
};

export const ocrApi = {
  scanBill: async (
    input:
      | string
      | {
          uri: string;
          fileName?: string | null;
          mimeType?: string | null;
          base64?: string | null;
        },
  ) => {
    const imageUri = typeof input === "string" ? input : input.uri;
    const providedName = typeof input === "string" ? undefined : input.fileName || undefined;
    const providedMimeType =
      typeof input === "string" ? undefined : input.mimeType || undefined;
    const base64Image = typeof input === "string" ? undefined : input.base64 || undefined;

    const inferredName = imageUri.split("/").pop() || "bill.jpg";
    const fileName = providedName || inferredName;
    const extension = fileName.split(".").pop()?.toLowerCase();
    const fileType =
      providedMimeType ||
      (extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : extension === "heic" || extension === "heif"
            ? "image/heic"
            : "image/jpeg");
    const formData = new FormData();

    if (Platform.OS === "web") {
      const imageResponse = await fetch(imageUri);
      const imageBlob = await imageResponse.blob();
      formData.append("image", imageBlob, fileName);
    } else {
      formData.append("image", {
        uri: imageUri,
        name: fileName,
        type: fileType,
      } as unknown as Blob);
    }

    let response;
    try {
      response = await api.post<BackendOCRResponse>("/ocr/scan", formData, {
        // OCR can take longer due to provider retries/fallbacks.
        timeout: 120000,
      });
    } catch (error) {
      // Mobile multipart can fail intermittently on some Android/iOS builds.
      // Retry via JSON base64 payload, which backend supports as well.
      if (base64Image) {
        response = await api.post<BackendOCRResponse>(
          "/ocr/scan",
          {
            base64Image: `data:${fileType};base64,${base64Image}`,
          },
          { timeout: 120000 },
        );
      } else {
        throw error;
      }
    }

    return {
      ...response,
      data: {
        supplierName: response.data.data.supplierName,
        invoiceNumber: response.data.data.invoiceNumber,
        invoiceDate: response.data.data.invoiceDate,
        medicines: response.data.data.items.map((item) => ({
          name: item.name,
          distributor: item.distributor,
          quantity: item.quantity,
          purchaseRate: item.purchaseRate,
          mrp: item.mrp,
          batchNumber: item.batchNumber,
          expiry: item.expiryDate,
          expiryDate: item.expiryDate,
        })),
      } satisfies OCRResult,
    };
  },
};

export const stockApi = {
  getStock: async () => {
    const response = await api.get<BackendMedicine[]>("/stock");
    return { ...response, data: response.data.map(mapMedicine) };
  },
  getStockById: async (id: string) => {
    const response = await api.get<BackendMedicine>(`/stock/${id}`);
    return { ...response, data: mapMedicine(response.data) };
  },
  saveFromOCR: (payload: OCRResult) =>
    api.post("/stock/add-from-ocr", {
      supplierName: payload.supplierName,
      invoiceNumber: payload.invoiceNumber,
      invoiceDate: payload.invoiceDate?.trim()
        ? payload.invoiceDate.trim()
        : new Date().toISOString().slice(0, 10),
      items: payload.medicines.map((item) => ({
          name: item.name?.trim() || "",
          distributor:
            item.distributor?.trim() ||
            payload.supplierName?.trim() ||
            "Unknown",
          batchNumber: item.batchNumber?.trim() || "",
          expiryDate: (item.expiryDate || item.expiry || "").trim(),
          quantity: Number(item.quantity) || 0,
          purchaseRate: Number(item.purchaseRate) || 0,
          mrp: Number(item.mrp) || 0,
        })),
    }),
  addManualStock: (payload: ManualStockInput) =>
    api.post("/stock/add-from-ocr", {
      supplierName: payload.distributor || "Manual Entry",
      invoiceNumber: `MANUAL-${Date.now()}`,
      invoiceDate: new Date().toISOString().slice(0, 10),
      items: [
        {
          name: payload.name,
          distributor: payload.distributor || "Manual Entry",
          batchNumber: payload.batchNumber,
          expiryDate: payload.expiryDate,
          quantity: Number(payload.quantity),
          purchaseRate: Number(payload.purchaseRate),
          mrp: Number(payload.mrp),
        },
      ],
    }),
  updateDistributor: (oldName: string, newName: string) =>
    api.put("/stock/distributor", { oldName, newName }),
  disposeBatch: (id: string, batchNumber: string) =>
    api.delete(`/stock/${id}/batch/${encodeURIComponent(batchNumber)}`),
};

export const dashboardApi = {
  getStats: () => api.get<DashboardResponse>("/dashboard"),
};

export const profileApi = {
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data: { name: string; medicalName: string; address: string; drugLicense: string }) =>
    api.put("/auth/profile", data),
};

export { TOKEN_KEY, USER_KEY, clearAuthStorage };
