import { Badge, Button, Card, CircularProgressBar } from '@/components/';

import { PomodoroSettings, usePomodoroSettings } from './settings';

import {
  Brain,
  Coffee,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  Settings,
  Square,
  StepForward,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  cycleCount: number;
}

const defaultTimerState: TimerState = {
  timeLeft: 25 * 60,
  isRunning: false,
  isBreak: false,
  cycleCount: 0,
};

export const Pomodoro = (): JSX.Element => {
  const [settings] = usePomodoroSettings();
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

  const [timerState, setTimerState] = useState<TimerState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('timerState');
        return savedState ? JSON.parse(savedState) : { ...defaultTimerState, timeLeft: focusTime };
      } catch (error) {
        console.error('Error loading timer state from localStorage:', error);
        return { ...defaultTimerState, timeLeft: focusTime };
      }
    } else {
      return { ...defaultTimerState, timeLeft: focusTime };
    }
  });

  const { timeLeft, isRunning, isBreak, cycleCount } = timerState;
  const [isTimeVisible, setIsTimeVisible] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const maxTime = useMemo(
    () =>
      isBreak
        ? cycleCount % cyclesBeforeLongBreak === 0
          ? longBreakTime
          : shortBreakTime
        : focusTime,
    [isBreak, cycleCount, cyclesBeforeLongBreak, focusTime, shortBreakTime, longBreakTime]
  );

  const handleCycleChange = useCallback(() => {
    setTimerState((prevState) => {
      const newCycleCount = prevState.isBreak ? prevState.cycleCount : prevState.cycleCount + 1;
      const isNextBreak = !prevState.isBreak;
      const nextTimeLeft = isNextBreak
        ? newCycleCount % cyclesBeforeLongBreak === 0
          ? longBreakTime
          : shortBreakTime
        : focusTime;
      return {
        ...prevState,
        cycleCount: newCycleCount,
        timeLeft: nextTimeLeft,
        isBreak: isNextBreak,
        isRunning: isNextBreak ? autoStartBreak : autoStartFocus,
      };
    });
  }, [
    focusTime,
    shortBreakTime,
    longBreakTime,
    cyclesBeforeLongBreak,
    autoStartFocus,
    autoStartBreak,
  ]);

  const notifyUser = useCallback(() => {
    const message = isBreak ? 'Time to focus!' : 'Time to take a break!';
    if (desktopNotifications) {
      new Notification(message);
    }
    if (browserAlerts) {
      alert(message);
    }
  }, [desktopNotifications, browserAlerts, isBreak]);

  const handleTimeEnd = useCallback(() => {
    playSound();
    notifyUser();
    handleCycleChange();
  }, [handleCycleChange, notifyUser]);

  useEffect(() => {
    if (!isRunning) {
      setTimerState((prevState) => ({
        ...prevState,
        timeLeft: focusTime,
      }));
    }
  }, [focusTime, shortBreakTime, longBreakTime, isRunning]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerState((prevState) => {
          if (prevState.timeLeft <= 1) {
            handleTimeEnd();
            return { ...prevState, timeLeft: maxTime - 1 };
          }
          return { ...prevState, timeLeft: prevState.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, handleTimeEnd, maxTime]);

  useEffect(() => {
    try {
      localStorage.setItem('timerState', JSON.stringify(timerState));
    } catch (error) {
      console.error('Error saving timer state to localStorage:', error);
    }
  }, [timerState]);

  const startTimer = useCallback(() => {
    setTimerState((prevState) => ({
      ...prevState,
      isRunning: !prevState.isRunning,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState({
      timeLeft: focusTime,
      isRunning: false,
      isBreak: false,
      cycleCount: 0,
    });
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [focusTime]);

  const nextTimer = useCallback(() => {
    setTimerState((prevState) => ({
      ...prevState,
      isRunning: false,
    }));
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    handleCycleChange();
  }, [handleCycleChange]);

  const toggleTimeVisibility = useCallback(() => {
    setIsTimeVisible((prevIsTimeVisible) => !prevIsTimeVisible);
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.play();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const badge = {
    focus: {
      className:
        'bg-blue-500/30 text-blue-800 dark:text-blue-200 border-blue-500 hover:bg-blue-500/80',
      text: 'Focus',
      icon: <Brain className="h-4 w-4" />,
    },
    shortBreak: {
      className:
        'bg-yellow-500/30 text-yellow-800 dark:text-yellow-200 border-yellow-500 hover:bg-yellow-500/80',
      text: 'Short Break',
      icon: <Coffee className="h-4 w-4" />,
    },
    longBreak: {
      className:
        'bg-violet-500/30 text-violet-800 dark:text-violet-200 border-violet-500 hover:bg-violet-500/80',
      text: 'Long Break',
      icon: <Coffee className="h-4 w-4" />,
    },
  };

  const badgeStyle = useMemo(() => {
    if (isBreak) {
      return cycleCount % cyclesBeforeLongBreak === 0 ? badge.longBreak : badge.shortBreak;
    }
    return badge.focus;
  }, [isBreak, cycleCount, cyclesBeforeLongBreak, badge]);

  const progressValue = maxTime - timeLeft;

  return (
    <Card className="flex w-[294px] flex-col justify-center gap-2 px-4 py-3">
      <audio ref={audioRef}>
        <source src={`/sounds/${selectedSound}.mp3`} type="audio/mpeg" />
      </audio>
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">{isSettingsOpen ? 'Settings' : 'Pomodoro'}</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen((prev) => !prev)}>
          {isSettingsOpen ? <X /> : <Settings />}
        </Button>
      </div>
      {isSettingsOpen ? (
        <PomodoroSettings />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Badge className={badgeStyle.className}>
            {badgeStyle.icon}
            {badgeStyle.text}
          </Badge>
          <CircularProgressBar
            value={progressValue}
            max={maxTime}
            text={isTimeVisible ? formatTime(timeLeft) : '**:**'}
            variant={
              isBreak
                ? cycleCount % cyclesBeforeLongBreak === 0
                  ? 'longBreak'
                  : 'shortBreak'
                : 'focus'
            }
          />
          <div className="flex justify-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTimeVisibility}>
              {isTimeVisible ? <EyeOff /> : <Eye />}
            </Button>
            <Button variant="ghost" size="icon" onClick={startTimer}>
              {isRunning ? <Square /> : <Play />}
            </Button>
            <Button variant="ghost" size="icon" onClick={resetTimer}>
              <RotateCcw />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextTimer}>
              <StepForward />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
