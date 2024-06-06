import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/';
import { useLocalStorage } from '@/hooks/useLocalStorage';

import { useEffect, useRef, useState } from 'react';

interface PomodoroSettings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  cyclesBeforeLongBreak: number;
  autoStartFocus: boolean;
  autoStartBreak: boolean;
  selectedSound: string;
  volume: number;
  desktopNotifications: boolean;
  browserAlerts: boolean;
}

const defaultPomodoroSettings: PomodoroSettings = {
  focusTime: 25 * 60,
  shortBreakTime: 5 * 60,
  longBreakTime: 15 * 60,
  cyclesBeforeLongBreak: 4,
  autoStartFocus: false,
  autoStartBreak: false,
  selectedSound: 'beep',
  volume: 50,
  desktopNotifications: false,
  browserAlerts: false,
};

export const usePomodoroSettings = () => {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
    'pomodoroSettings',
    defaultPomodoroSettings
  );

  const updateSetting = (key: keyof PomodoroSettings, value: any) => {
    setSettings((prevSettings: PomodoroSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  return [settings, updateSetting] as const;
};

export const PomodoroSettings = (): JSX.Element => {
  const [settings, updateSetting] = usePomodoroSettings();
  const {
    focusTime,
    shortBreakTime,
    longBreakTime,
    cyclesBeforeLongBreak,
    autoStartFocus,
    autoStartBreak,
    selectedSound,
    volume,
    desktopNotifications,
    browserAlerts,
  } = settings;

  const isFirstRender = useRef(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  useEffect(() => {
    if (!isFirstRender.current && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume / 100;
      audioRef.current.src = `/sounds/${selectedSound}.mp3`;
      audioRef.current.play();
    }
    isFirstRender.current = false;
  }, [selectedSound, volume]);

  const handleDesktopNotificationsChange = async (checked: boolean) => {
    if (checked && notificationPermission !== 'granted') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== 'granted') {
        updateSetting('desktopNotifications', false);
        return;
      }
    }
    updateSetting('desktopNotifications', checked);
  };

  useEffect(() => {
    if (desktopNotifications && Notification.permission !== 'granted') {
      updateSetting('desktopNotifications', false);
    }
  }, [desktopNotifications]);

  return (
    <Tabs defaultValue="timer">
      <audio ref={audioRef}>
        <source src={`/sounds/${selectedSound}.mp3`} type="audio/mpeg" />
      </audio>
      <TabsList>
        <TabsTrigger value="timer">Timer</TabsTrigger>
        <TabsTrigger value="sound">Sound</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="timer">
        <div className="flex h-[150px] flex-col gap-3 overflow-y-auto">
          <div className="flex flex-col">
            <div className="font-medium">Time (minutes)</div>
            <div className="flex justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium text-muted-foreground">Pomodoro</div>
                <Input
                  type="number"
                  value={focusTime / 60}
                  onChange={(e) => updateSetting('focusTime', Number(e.target.value) * 60)}
                  className="w-16"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium text-muted-foreground">Short break</div>
                <Input
                  type="number"
                  value={shortBreakTime / 60}
                  onChange={(e) => updateSetting('shortBreakTime', Number(e.target.value) * 60)}
                  className="w-16"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium text-muted-foreground">Long break</div>
                <Input
                  type="number"
                  value={longBreakTime / 60}
                  onChange={(e) => updateSetting('longBreakTime', Number(e.target.value) * 60)}
                  className="w-16"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Long break interval</div>
            <Input
              type="number"
              value={cyclesBeforeLongBreak}
              onChange={(e) => updateSetting('cyclesBeforeLongBreak', Number(e.target.value))}
              className="w-16"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Auto start focus</div>
            <Switch
              checked={autoStartFocus}
              onCheckedChange={(checked) => updateSetting('autoStartFocus', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Auto start break</div>
            <Switch
              checked={autoStartBreak}
              onCheckedChange={(checked) => updateSetting('autoStartBreak', checked)}
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="sound">
        <div className="flex h-[150px] flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="font-medium">Sound</div>
            <Select
              value={selectedSound}
              onValueChange={(value) => updateSetting('selectedSound', value)}
            >
              <SelectTrigger className="w-auto">
                <SelectValue placeholder={selectedSound} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beep">Beep</SelectItem>
                <SelectItem value="ring">Ring</SelectItem>
                <SelectItem value="tic-tac">Tic-Tac</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">Volume</div>
              <div className="font-medium">{volume}%</div>
            </div>
            <Slider
              value={[volume]}
              max={100}
              onValueChange={(value) => updateSetting('volume', value[0])}
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="flex h-[150px] flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="font-medium">Desktop notifications</div>
            <Switch
              checked={desktopNotifications}
              onCheckedChange={handleDesktopNotificationsChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Browser alerts</div>
            <Switch
              checked={browserAlerts}
              onCheckedChange={(checked) => updateSetting('browserAlerts', checked)}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
