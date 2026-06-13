import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: true,

      toggleTheme: () => {
        const newDark = !get().isDark;
        set({ isDark: newDark });
        if (newDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      },

      initTheme: () => {
        const isDark = get().isDark;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.add('light');
        }
      },
    }),
    {
      name: 'terra-theme',
    }
  )
);
