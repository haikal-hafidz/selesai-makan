const PREFS_KEY = 'selesai_makan_prefs';

export interface UserPreferences {
  activeView: 'classes' | 'resources' | 'quizzes' | 'settings';
  selectedClassId?: string;
  selectedLessonId?: string;
  theme: 'light' | 'sepia' | 'dark';
  editorFontSize: 'small' | 'medium' | 'large';
}

const defaultPreferences: UserPreferences = {
  activeView: 'classes',
  theme: 'light',
  editorFontSize: 'medium',
};

export const preferencesService = {
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(PREFS_KEY);
      if (data) {
        return { ...defaultPreferences, ...JSON.parse(data) };
      }
    } catch {
      // ignore
    }
    return defaultPreferences;
  },

  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return defaultPreferences;
    }
  },
};
