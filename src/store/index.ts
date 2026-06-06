// src/store/index.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServerConfig } from '@utils/ssh';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  type: 'temp' | 'cpu' | 'disk' | 'down';
  server: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'amoled';
  language: string;
  pinEnabled: boolean;
  pin: string;
  biometricEnabled: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  sshTimeout: number;
  keepAlive: boolean;
  notifications: {
    temp: boolean; cpu: boolean; disk: boolean; serverDown: boolean;
  };
  thresholds: {
    temp: number; cpu: number; disk: number;
  };
}

// ── Store ──────────────────────────────────────────────────────────────────
interface AppStore {
  // Servers
  servers: ServerConfig[];
  activeServerId: string | null;
  addServer: (s: ServerConfig) => void;
  removeServer: (id: string) => void;
  updateServer: (id: string, updates: Partial<ServerConfig>) => void;
  setActiveServer: (id: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Alerts
  alerts: Alert[];
  addAlert: (a: Alert) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;

  // App state
  isLocked: boolean;
  setLocked: (v: boolean) => void;
  commandHistory: string[];
  addToHistory: (cmd: string) => void;

  // Persist
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  exportAll: () => string;
  importAll: (json: string) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'ro',
  pinEnabled: true,
  pin: '1234',
  biometricEnabled: false,
  fontSize: 'md',
  sshTimeout: 30,
  keepAlive: true,
  notifications: { temp: true, cpu: true, disk: true, serverDown: true },
  thresholds: { temp: 80, cpu: 85, disk: 90 },
};

export const useStore = create<AppStore>((set, get) => ({
  servers: [],
  activeServerId: null,
  settings: DEFAULT_SETTINGS,
  alerts: [],
  isLocked: true,
  commandHistory: [],

  addServer: (s) => {
    set(st => ({ servers: [...st.servers, s] }));
    get().persist();
  },
  removeServer: (id) => {
    set(st => ({ servers: st.servers.filter(s => s.id !== id) }));
    get().persist();
  },
  updateServer: (id, updates) => {
    set(st => ({ servers: st.servers.map(s => s.id === id ? { ...s, ...updates } : s) }));
    get().persist();
  },
  setActiveServer: (id) => set({ activeServerId: id }),

  updateSettings: (updates) => {
    set(st => ({ settings: { ...st.settings, ...updates } }));
    get().persist();
  },

  addAlert: (a) => set(st => ({ alerts: [a, ...st.alerts].slice(0, 100) })),
  markAlertRead: (id) => set(st => ({ alerts: st.alerts.map(a => a.id === id ? { ...a, read: true } : a) })),
  clearAlerts: () => set({ alerts: [] }),

  setLocked: (v) => set({ isLocked: v }),

  addToHistory: (cmd) => set(st => ({
    commandHistory: [cmd, ...st.commandHistory.filter(c => c !== cmd)].slice(0, 100),
  })),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem('@serverpilot_state');
      if (raw) {
        const saved = JSON.parse(raw);
        set({
          servers: saved.servers || [],
          activeServerId: saved.activeServerId || null,
          settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
          alerts: saved.alerts || [],
          commandHistory: saved.commandHistory || [],
        });
      }
    } catch (e) { console.warn('Hydrate failed', e); }
  },

  persist: async () => {
    const st = get();
    const payload = {
      servers: st.servers,
      activeServerId: st.activeServerId,
      settings: st.settings,
      alerts: st.alerts,
      commandHistory: st.commandHistory,
    };
    await AsyncStorage.setItem('@serverpilot_state', JSON.stringify(payload));
  },

  exportAll: () => {
    const st = get();
    return JSON.stringify({
      version: '1.0',
      exported: new Date().toISOString(),
      servers: st.servers.map(s => ({ ...s, password: undefined })), // strip passwords
      settings: st.settings,
      commandHistory: st.commandHistory,
    }, null, 2);
  },

  importAll: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.servers)  set({ servers: data.servers });
      if (data.settings) set({ settings: { ...DEFAULT_SETTINGS, ...data.settings } });
      get().persist();
    } catch (e) { console.error('Import failed', e); }
  },
}));
