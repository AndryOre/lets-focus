import { Card, ToggleGroup, ToggleGroupItem } from '@/components/';

import { Monitor, MoonStar, Sun } from 'lucide-react';
import * as React from 'react';

export const ThemeToggle = (): JSX.Element => {
  const [theme, setThemeState] = React.useState<'light' | 'dark' | 'system'>('light');

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setThemeState(isDarkMode ? 'dark' : 'light');
  }, []);

  React.useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
  }, [theme]);

  return (
    <Card className="gap-2 px-4 py-3">
      <ToggleGroup type="single">
        <ToggleGroupItem
          value="light"
          className="aspect-square p-0"
          onClick={() => setThemeState('light')}
        >
          <Sun className="h-6 w-6" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="system"
          className="aspect-square p-0"
          onClick={() => setThemeState('system')}
        >
          <Monitor className="h-6 w-6" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          className="aspect-square p-0"
          onClick={() => setThemeState('dark')}
        >
          <MoonStar className="h-6 w-6" />
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="text-center text-xl font-bold">Theme</p>
    </Card>
  );
};
