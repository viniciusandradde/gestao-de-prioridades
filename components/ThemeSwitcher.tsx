import React from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
       <label htmlFor="theme-switcher" className="text-sm font-medium text-[--color-text-secondary]">Tema:</label>
      <select
        id="theme-switcher"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="px-3 py-1.5 border border-[--color-border] rounded-lg focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary] transition bg-[--color-foreground] text-sm text-[--color-text-primary]"
      >
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
        <option value="ocean">Oceano</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher;
