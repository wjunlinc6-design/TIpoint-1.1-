import { FocusSession, UserConfig, Tag } from '../types';

const STORAGE_KEYS = {
  USER_CONFIG: 'tipoint_user_config',
  FOCUS_SESSIONS: 'tipoint_focus_sessions',
  TAGS: 'tipoint_tags',
};

const DEFAULT_CONFIG: UserConfig = {
  isOnboarded: false,
  userName: '',
  userAvatarUrl: '',
  userSceneUrl: '',
  dailyWaterCount: 0,
  lastWaterDate: new Date().toISOString().split('T')[0],
  waterHistory: {},
};

export const StorageService = {
  getUserConfig: (): UserConfig => {
    const config = localStorage.getItem(STORAGE_KEYS.USER_CONFIG);
    if (!config) return DEFAULT_CONFIG;
    
    const parsed = JSON.parse(config) as UserConfig;
    if (!parsed.waterHistory) parsed.waterHistory = {};
    
    const today = new Date().toISOString().split('T')[0];
    
    // Daily water reset logic
    if (parsed.lastWaterDate !== today) {
      // Archive yesterday's count if not already done
      if (parsed.lastWaterDate && parsed.dailyWaterCount > 0) {
          parsed.waterHistory[parsed.lastWaterDate] = parsed.dailyWaterCount;
      }
      parsed.dailyWaterCount = 0;
      parsed.lastWaterDate = today;
      StorageService.saveUserConfig(parsed);
    }
    
    return parsed;
  },

  saveUserConfig: (config: UserConfig) => {
    // Keep history in sync
    const today = new Date().toISOString().split('T')[0];
    if (!config.waterHistory) config.waterHistory = {};
    config.waterHistory[today] = config.dailyWaterCount;
    
    localStorage.setItem(STORAGE_KEYS.USER_CONFIG, JSON.stringify(config));
  },

  getFocusSessions: (): FocusSession[] => {
    const sessions = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
    return sessions ? JSON.parse(sessions) : [];
  },

  addFocusSession: (session: FocusSession) => {
    const sessions = StorageService.getFocusSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
  },

  deleteFocusSession: (sessionId: string) => {
    const sessions = StorageService.getFocusSessions();
    const updated = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(updated));
  },

  updateFocusSession: (session: FocusSession) => {
    const sessions = StorageService.getFocusSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      sessions[index] = session;
      localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
    }
  },

  getTags: (): Tag[] => {
    const tags = localStorage.getItem(STORAGE_KEYS.TAGS);
    return tags ? JSON.parse(tags) : [];
  },

  addTag: (tag: Tag) => {
    const tags = StorageService.getTags();
    tags.push(tag);
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.FOCUS_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.TAGS);
  }
};
