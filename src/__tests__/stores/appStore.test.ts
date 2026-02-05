/**
 * App Store Tests
 * 测试状态管理功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore, SessionMode, type Message, type Session } from '@/stores/appStore';

describe('AppStore', () => {
  beforeEach(() => {
    // 清除 Zustand 状态
    useAppStore.setState({
      currentMessages: [],
      selectedModel: 'glm-4-flash',
      theme: 'light',
      sessions: [],
      generatedAssets: [],
      currentSessionId: null,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const state = useAppStore.getState();

      expect(state.currentMessages).toEqual([]);
      expect(state.selectedModel).toBe('glm-4-flash');
      expect(state.theme).toBe('light');
      expect(state.sessions).toEqual([]);
      expect(state.generatedAssets).toEqual([]);
      expect(state.currentSessionId).toBeNull();
    });
  });

  describe('Message Management', () => {
    it('should add a message to currentMessages', () => {
      const { addMessage, currentMessages } = useAppStore.getState();

      const message: Message = {
        id: 'msg-1',
        role: 'user',
        content: '你好',
        timestamp: Date.now(),
      };

      addMessage(message);

      const updatedMessages = useAppStore.getState().currentMessages;
      expect(updatedMessages).toHaveLength(1);
      expect(updatedMessages[0]).toEqual(message);
    });

    it('should add multiple messages in order', () => {
      const { addMessage } = useAppStore.getState();

      addMessage({
        id: 'msg-1',
        role: 'user',
        content: 'First',
        timestamp: 1000,
      });

      addMessage({
        id: 'msg-2',
        role: 'assistant',
        content: 'Second',
        timestamp: 2000,
      });

      const { currentMessages } = useAppStore.getState();
      expect(currentMessages).toHaveLength(2);
      expect(currentMessages[0].content).toBe('First');
      expect(currentMessages[1].content).toBe('Second');
    });

    it('should clear all messages', () => {
      const { addMessage, clearMessages } = useAppStore.getState();

      addMessage({
        id: 'msg-1',
        role: 'user',
        content: '消息1',
        timestamp: Date.now(),
      });

      addMessage({
        id: 'msg-2',
        role: 'assistant',
        content: '消息2',
        timestamp: Date.now(),
      });

      clearMessages();

      expect(useAppStore.getState().currentMessages).toEqual([]);
    });

    it('should handle all message roles', () => {
      const { addMessage, currentMessages } = useAppStore.getState();

      addMessage({ id: '1', role: 'system', content: 'System prompt', timestamp: Date.now() });
      addMessage({ id: '2', role: 'user', content: 'User message', timestamp: Date.now() });
      addMessage({ id: '3', role: 'assistant', content: 'Assistant response', timestamp: Date.now() });

      expect(currentMessages).toHaveLength(3);
      expect(currentMessages[0].role).toBe('system');
      expect(currentMessages[1].role).toBe('user');
      expect(currentMessages[2].role).toBe('assistant');
    });
  });

  describe('Session Management', () => {
    it('should create a new session with unique ID', () => {
      const { createSession, sessions } = useAppStore.getState();

      const sessionId1 = createSession('chat', '会话1');
      const sessionId2 = createSession('chat', '会话2');

      expect(sessionId1).not.toBe(sessionId2);
      expect(sessions).toHaveLength(2);
    });

    it('should create session with correct properties', () => {
      const { createSession, sessions } = useAppStore.getState();

      const sessionId = createSession('image', '图像生成测试');

      const session = sessions.find((s) => s.id === sessionId);
      expect(session).toBeDefined();
      expect(session?.mode).toBe('image');
      expect(session?.title).toBe('图像生成测试');
      expect(session?.messages).toEqual([]);
      expect(session?.createdAt).toBeGreaterThan(0);
      expect(session?.updatedAt).toBeGreaterThan(0);
    });

    it('should set current session ID when creating session', () => {
      const { createSession, currentSessionId } = useAppStore.getState();

      const sessionId = createSession('chat', '新会话');

      expect(useAppStore.getState().currentSessionId).toBe(sessionId);
    });

    it('should clear current messages when creating session', () => {
      const { addMessage, createSession, currentMessages } = useAppStore.getState();

      addMessage({
        id: 'msg-1',
        role: 'user',
        content: '之前会话的消息',
        timestamp: Date.now(),
      });

      createSession('chat', '新会话');

      expect(useAppStore.getState().currentMessages).toEqual([]);
    });

    it('should update session properties', () => {
      const { createSession, updateSession, sessions } = useAppStore.getState();

      const sessionId = createSession('chat', '原标题');
      const originalUpdatedAt = sessions[0].updatedAt;

      // 等待一下以确保 updatedAt 不同
      setTimeout(() => {
        updateSession(sessionId, { title: '新标题' });

        const session = sessions.find((s) => s.id === sessionId);
        expect(session?.title).toBe('新标题');
        expect(session?.updatedAt).toBeGreaterThan(originalUpdatedAt);
      }, 10);
    });

    it('should update session messages', () => {
      const { createSession, updateSession, sessions } = useAppStore.getState();

      const sessionId = createSession('chat', '测试');
      const messages = [
        { id: '1', role: 'user' as const, content: 'Hello', timestamp: Date.now() },
      ];

      updateSession(sessionId, { messages });

      const session = sessions.find((s) => s.id === sessionId);
      expect(session?.messages).toEqual(messages);
    });

    it('should delete session by ID', () => {
      const { createSession, deleteSession, sessions } = useAppStore.getState();

      const sessionId1 = createSession('chat', '会话1');
      const sessionId2 = createSession('chat', '会话2');

      expect(sessions).toHaveLength(2);

      deleteSession(sessionId1);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(sessionId2);
    });

    it('should clear current session ID when deleting current session', () => {
      const { createSession, deleteSession, currentSessionId } = useAppStore.getState();

      const sessionId = createSession('chat', '测试会话');
      expect(useAppStore.getState().currentSessionId).toBe(sessionId);

      deleteSession(sessionId);

      expect(useAppStore.getState().currentSessionId).toBeNull();
    });

    it('should keep current session ID when deleting non-current session', () => {
      const { createSession, deleteSession } = useAppStore.getState();

      const sessionId1 = createSession('chat', '会话1');
      const sessionId2 = createSession('chat', '会话2');

      deleteSession(sessionId1);

      expect(useAppStore.getState().currentSessionId).toBe(sessionId2);
    });

    it('should delete associated assets when deleting session', () => {
      const { createSession, deleteSession, addGeneratedAsset, generatedAssets } = useAppStore.getState();

      const sessionId1 = createSession('chat', '会话1');
      const sessionId2 = createSession('chat', '会话2');

      addGeneratedAsset({
        type: 'image',
        sessionId: sessionId1,
        title: '资产1',
        content: 'data1',
      });

      addGeneratedAsset({
        type: 'image',
        sessionId: sessionId2,
        title: '资产2',
        content: 'data2',
      });

      expect(generatedAssets).toHaveLength(2);

      deleteSession(sessionId1);

      expect(useAppStore.getState().generatedAssets).toHaveLength(1);
      expect(useAppStore.getState().generatedAssets[0].sessionId).toBe(sessionId2);
    });

    it('should set current session and load its messages', () => {
      const { createSession, setCurrentSession, updateSession, currentMessages } = useAppStore.getState();

      const sessionId = createSession('chat', '会话1');

      const messages = [
        { id: '1', role: 'user' as const, content: 'Hello', timestamp: Date.now() },
      ];
      updateSession(sessionId, { messages });

      setCurrentSession(sessionId);

      expect(useAppStore.getState().currentSessionId).toBe(sessionId);
      expect(useAppStore.getState().currentMessages).toEqual(messages);
    });

    it('should clear current session when setting null', () => {
      const { createSession, setCurrentSession } = useAppStore.getState();

      createSession('chat', '会话1');
      expect(useAppStore.getState().currentSessionId).toBeTruthy();

      setCurrentSession(null);

      expect(useAppStore.getState().currentSessionId).toBeNull();
      expect(useAppStore.getState().currentMessages).toEqual([]);
    });

    it('should get session by ID', () => {
      const { createSession, getSessionById } = useAppStore.getState();

      const sessionId = createSession('video', '视频会话');
      const session = getSessionById(sessionId);

      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.mode).toBe('video');
    });

    it('should return undefined for non-existent session', () => {
      const { getSessionById } = useAppStore.getState();

      const session = getSessionById('non-existent-id');

      expect(session).toBeUndefined();
    });

    it('should create sessions with different modes', () => {
      const { createSession, sessions } = useAppStore.getState();

      createSession('chat', '聊天');
      createSession('image', '图像');
      createSession('video', '视频');
      createSession('code', '代码');

      expect(sessions).toHaveLength(4);
      expect(sessions[0].mode).toBe('chat');
      expect(sessions[1].mode).toBe('image');
      expect(sessions[2].mode).toBe('video');
      expect(sessions[3].mode).toBe('code');
    });
  });

  describe('Generated Asset Management', () => {
    it('should add a generated asset with auto-generated ID', () => {
      const { addGeneratedAsset, generatedAssets } = useAppStore.getState();

      addGeneratedAsset({
        type: 'image',
        sessionId: 'session-1',
        title: '测试图像',
        content: 'image data',
      });

      expect(generatedAssets).toHaveLength(1);
      expect(generatedAssets[0].id).toMatch(/^asset-/);
      expect(generatedAssets[0].createdAt).toBeGreaterThan(0);
    });

    it('should add multiple assets in chronological order', () => {
      const { addGeneratedAsset, generatedAssets } = useAppStore.getState();

      addGeneratedAsset({
        type: 'image',
        sessionId: 'session-1',
        title: '资产1',
        content: 'data1',
      });

      // 确保时间戳不同
      setTimeout(() => {
        addGeneratedAsset({
          type: 'video',
          sessionId: 'session-1',
          title: '资产2',
          content: 'data2',
        });

        const assets = useAppStore.getState().generatedAssets;
        expect(assets).toHaveLength(2);
        expect(assets[0].createdAt).toBeLessThan(assets[1].createdAt);
      }, 10);
    });

    it('should delete asset by ID', () => {
      const { addGeneratedAsset, deleteGeneratedAsset, generatedAssets } = useAppStore.getState();

      addGeneratedAsset({
        type: 'image',
        sessionId: 'session-1',
        title: '图像',
        content: 'data',
      });

      const assetId = generatedAssets[0].id;
      deleteGeneratedAsset(assetId);

      expect(useAppStore.getState().generatedAssets).toHaveLength(0);
    });

    it('should filter assets by session ID', () => {
      const { addGeneratedAsset, getAssetsBySessionId } = useAppStore.getState();

      addGeneratedAsset({
        type: 'image',
        sessionId: 'session-1',
        title: '图像1',
        content: 'data1',
      });

      addGeneratedAsset({
        type: 'image',
        sessionId: 'session-2',
        title: '图像2',
        content: 'data2',
      });

      addGeneratedAsset({
        type: 'video',
        sessionId: 'session-1',
        title: '视频1',
        content: 'data3',
      });

      const session1Assets = getAssetsBySessionId('session-1');
      expect(session1Assets).toHaveLength(2);
      expect(session1Assets[0].title).toBe('视频1'); // 最新的在前
      expect(session1Assets[1].title).toBe('图像1');

      const session2Assets = getAssetsBySessionId('session-2');
      expect(session2Assets).toHaveLength(1);
      expect(session2Assets[0].title).toBe('图像2');
    });

    it('should filter assets by type', () => {
      const { addGeneratedAsset, getAssetsByType } = useAppStore.getState();

      addGeneratedAsset({
        type: 'image',
        sessionId: 'session-1',
        title: '图像1',
        content: 'data1',
      });

      addGeneratedAsset({
        type: 'video',
        sessionId: 'session-1',
        title: '视频1',
        content: 'data2',
      });

      addGeneratedAsset({
        type: 'image',
        sessionId: 'session-2',
        title: '图像2',
        content: 'data3',
      });

      addGeneratedAsset({
        type: 'code',
        sessionId: 'session-1',
        title: '代码1',
        content: 'data4',
      });

      const imageAssets = getAssetsByType('image');
      expect(imageAssets).toHaveLength(2);
      expect(imageAssets.every((a) => a.type === 'image')).toBe(true);

      const videoAssets = getAssetsByType('video');
      expect(videoAssets).toHaveLength(1);
      expect(videoAssets[0].type).toBe('video');

      const codeAssets = getAssetsByType('code');
      expect(codeAssets).toHaveLength(1);

      const documentAssets = getAssetsByType('document');
      expect(documentAssets).toHaveLength(0);
    });

    it('should support all asset types', () => {
      const { addGeneratedAsset, getAssetsByType } = useAppStore.getState();

      addGeneratedAsset({ type: 'image', sessionId: 's1', title: 'i', content: '' });
      addGeneratedAsset({ type: 'video', sessionId: 's1', title: 'v', content: '' });
      addGeneratedAsset({ type: 'code', sessionId: 's1', title: 'c', content: '' });
      addGeneratedAsset({ type: 'document', sessionId: 's1', title: 'd', content: '' });

      expect(getAssetsByType('image')).toHaveLength(1);
      expect(getAssetsByType('video')).toHaveLength(1);
      expect(getAssetsByType('code')).toHaveLength(1);
      expect(getAssetsByType('document')).toHaveLength(1);
    });

    it('should include thumbnail in asset', () => {
      const { addGeneratedAsset, generatedAssets } = useAppStore.getState();

      addGeneratedAsset({
        type: 'image',
        sessionId: 'session-1',
        title: '图像',
        content: 'data',
        thumbnail: 'thumbnail-url',
      });

      expect(generatedAssets[0].thumbnail).toBe('thumbnail-url');
    });
  });

  describe('Theme Management', () => {
    it('should set theme to light', () => {
      const { setTheme } = useAppStore.getState();

      setTheme('light');

      expect(useAppStore.getState().theme).toBe('light');
    });

    it('should set theme to dark', () => {
      const { setTheme } = useAppStore.getState();

      setTheme('dark');

      expect(useAppStore.getState().theme).toBe('dark');
    });

    it('should support theme toggling', () => {
      const { setTheme } = useAppStore.getState();

      setTheme('light');
      expect(useAppStore.getState().theme).toBe('light');

      setTheme('dark');
      expect(useAppStore.getState().theme).toBe('dark');

      setTheme('light');
      expect(useAppStore.getState().theme).toBe('light');
    });
  });

  describe('Model Selection', () => {
    it('should set selected model', () => {
      const { setSelectedModel } = useAppStore.getState();

      setSelectedModel('glm-4');

      expect(useAppStore.getState().selectedModel).toBe('glm-4');
    });

    it('should support different model names', () => {
      const { setSelectedModel } = useAppStore.getState();

      setSelectedModel('glm-4-flash');
      expect(useAppStore.getState().selectedModel).toBe('glm-4-flash');

      setSelectedModel('glm-4-plus');
      expect(useAppStore.getState().selectedModel).toBe('glm-4-plus');

      setSelectedModel('glm-4-air');
      expect(useAppStore.getState().selectedModel).toBe('glm-4-air');
    });
  });

  describe('State Immutability', () => {
    it('should not mutate existing arrays when adding messages', () => {
      const { addMessage, currentMessages } = useAppStore.getState();

      const originalMessages = [...currentMessages];
      addMessage({
        id: 'msg-1',
        role: 'user',
        content: 'New message',
        timestamp: Date.now(),
      });

      expect(currentMessages).toEqual(originalMessages);
      expect(useAppStore.getState().currentMessages).not.toBe(currentMessages);
    });

    it('should not mutate existing sessions when updating', () => {
      const { createSession, updateSession, sessions } = useAppStore.getState();

      const sessionId = createSession('chat', 'Original');
      const originalSessions = [...sessions];

      updateSession(sessionId, { title: 'Updated' });

      expect(originalSessions[0].title).toBe('Original');
      expect(sessions).not.toBe(useAppStore.getState().sessions);
    });
  });

  describe('Complex Workflows', () => {
    it('should handle complete chat workflow', () => {
      const { createSession, addMessage, updateSession, getSessionById } = useAppStore.getState();

      // 创建会话
      const sessionId = createSession('chat', '测试对话');

      // 添加消息
      addMessage({ id: '1', role: 'user', content: '你好', timestamp: Date.now() });
      addMessage({ id: '2', role: 'assistant', content: '你好！', timestamp: Date.now() });

      // 更新会话消息
      updateSession(sessionId, { messages: useAppStore.getState().currentMessages });

      // 验证
      const session = getSessionById(sessionId);
      expect(session?.messages).toHaveLength(2);
    });

    it('should handle switching between sessions', () => {
      const { createSession, setCurrentSession, addMessage } = useAppStore.getState();

      // 创建两个会话
      const session1 = createSession('chat', '会话1');
      addMessage({ id: '1', role: 'user', content: '消息1', timestamp: Date.now() });

      const session2 = createSession('chat', '会话2');
      addMessage({ id: '2', role: 'user', content: '消息2', timestamp: Date.now() });

      // 切换回会话1
      setCurrentSession(session1);

      expect(useAppStore.getState().currentSessionId).toBe(session1);
      expect(useAppStore.getState().currentMessages).toEqual([]);
      // (因为我们没有保存消息到会话)
    });

    it('should handle assets across multiple sessions', () => {
      const { createSession, addGeneratedAsset, getAssetsBySessionId } = useAppStore.getState();

      const session1 = createSession('image', '图像会话1');
      const session2 = createSession('image', '图像会话2');

      addGeneratedAsset({ type: 'image', sessionId: session1, title: '图像1', content: 'data1' });
      addGeneratedAsset({ type: 'image', sessionId: session2, title: '图像2', content: 'data2' });
      addGeneratedAsset({ type: 'image', sessionId: session1, title: '图像3', content: 'data3' });

      expect(getAssetsBySessionId(session1)).toHaveLength(2);
      expect(getAssetsBySessionId(session2)).toHaveLength(1);
    });
  });
});
