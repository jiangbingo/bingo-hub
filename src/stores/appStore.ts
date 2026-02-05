import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type SessionMode = 'chat' | 'image' | 'video' | 'code';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  mode: SessionMode;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'code' | 'document';
  sessionId: string;
  title: string;
  content: string;
  thumbnail?: string;
  createdAt: number;
}

interface AppState {
  // 状态
  currentMessages: Message[];
  selectedModel: string;
  theme: Theme;
  sessions: Session[];
  generatedAssets: GeneratedAsset[];
  currentSessionId: string | null;

  // Actions
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setSelectedModel: (model: string) => void;
  setTheme: (theme: Theme) => void;

  // Session Actions
  createSession: (mode: SessionMode, title: string) => string;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string | null) => void;
  getSessionById: (sessionId: string) => Session | undefined;

  // Generated Asset Actions
  addGeneratedAsset: (asset: Omit<GeneratedAsset, 'id' | 'createdAt'>) => void;
  deleteGeneratedAsset: (assetId: string) => void;
  getAssetsBySessionId: (sessionId: string) => GeneratedAsset[];
  getAssetsByType: (type: GeneratedAsset['type']) => GeneratedAsset[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentMessages: [],
      selectedModel: 'glm-4-flash',
      theme: 'light',
      sessions: [],
      generatedAssets: [],
      currentSessionId: null,

      // Actions
      addMessage: (message) => {
        set((state) => ({
          currentMessages: [...state.currentMessages, message],
        }));
      },

      clearMessages: () => {
        set({ currentMessages: [] });
      },

      setSelectedModel: (model) => {
        set({ selectedModel: model });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      // Session Actions
      createSession: (mode, title) => {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newSession: Session = {
          id: sessionId,
          mode,
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId,
          currentMessages: [],
        }));

        return sessionId;
      },

      updateSession: (sessionId, updates) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, ...updates, updatedAt: Date.now() }
              : session
          ),
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          generatedAssets: state.generatedAssets.filter((a) => a.sessionId !== sessionId),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        }));
      },

      setCurrentSession: (sessionId) => {
        const session = sessionId ? get().getSessionById(sessionId) : null;
        set({
          currentSessionId: sessionId,
          currentMessages: session?.messages ?? [],
        });
      },

      getSessionById: (sessionId) => {
        return get().sessions.find((s) => s.id === sessionId);
      },

      // Generated Asset Actions
      addGeneratedAsset: (asset) => {
        const newAsset: GeneratedAsset = {
          ...asset,
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };

        set((state) => ({
          generatedAssets: [newAsset, ...state.generatedAssets],
        }));
      },

      deleteGeneratedAsset: (assetId) => {
        set((state) => ({
          generatedAssets: state.generatedAssets.filter((a) => a.id !== assetId),
        }));
      },

      getAssetsBySessionId: (sessionId) => {
        return get().generatedAssets.filter((a) => a.sessionId === sessionId);
      },

      getAssetsByType: (type) => {
        return get().generatedAssets.filter((a) => a.type === type);
      },
    }),
    {
      name: 'bigmodel-storage',
      partialize: (state) => ({
        currentMessages: state.currentMessages,
        selectedModel: state.selectedModel,
        theme: state.theme,
        sessions: state.sessions,
        generatedAssets: state.generatedAssets,
      }),
    }
  )
);
