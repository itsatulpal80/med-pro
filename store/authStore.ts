import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { authApi, TOKEN_KEY } from "../services/api";

type User = {
  id: string;
  name: string;
  mobile: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  loading: boolean;
  login: (mobile: string, password: string) => Promise<void>;
  signup: (name: string, mobile: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  loading: false,

  hydrate: async () => {
    try {
      if (Platform.OS === "web") {
        const token = globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
        set({ token, hydrated: true });
        return;
      }

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      set({ token, hydrated: true });
    } catch {
      set({ token: null, hydrated: true });
    }
  },

  login: async (mobile, password) => {
    set({ loading: true });
    try {
      const { data } = await authApi.login(mobile, password);
      if (Platform.OS === "web") {
        globalThis.localStorage?.setItem(TOKEN_KEY, data.token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      }
      set({ token: data.token, user: data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signup: async (name, mobile, password) => {
    set({ loading: true });
    try {
      const { data } = await authApi.register(name, mobile, password);
      if (Platform.OS === "web") {
        globalThis.localStorage?.setItem(TOKEN_KEY, data.token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      }
      set({ token: data.token, user: data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    if (Platform.OS === "web") {
      globalThis.localStorage?.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    set({ token: null, user: null });
  },
}));
