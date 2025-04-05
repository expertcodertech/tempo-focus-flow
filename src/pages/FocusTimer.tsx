import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Settings2,
  Tag,
  Clock,
  BarChart,
  Check,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const FocusTimer = () => {
  const {
    isTimerRunning,
    setTimerRunning,
    pomodoroSettings,
    updatePomodoroSettings,
    focusSessions,
    addFocusSession,
  } = useAppStore();
  const { toast } = useToast();

  const [remainingTime, setRemainingTime] = useState(pomodoroSettings.focusDuration * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState(0);
  const [sessionTag, setSessionTag] = useState('');
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Function to start the timer
  const startTimer = () => {
    setTimerRunning(true);
    setTimerStartTime(Date.now());
    timerRef.current = window.setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Function to pause the timer
  const pauseTimer = () => {
    setTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Function to reset the timer
  const resetTimer = () => {
    pauseTimer();
    setRemainingTime(pomodoroSettings.focusDuration * 60);
    setIsBreak(false);
  };

  // Function to handle timer completion
  const handleTimerComplete = () => {
    pauseTimer();
    setCompletedPomodoros((prev) => prev + 1);

    if (!isBreak) {
      toast({
        title: "Focus session complete!",
        description: "Time for a break.",
      });
      startBreak();
    } else {
      toast({
        title: "Break complete!",
        description: "Time to get back to work.",
      });
      resetTimer();
    }
  };

  // Function to start a break
  const startBreak = () => {
    setIsBreak(true);
    setRemainingTime(pomodoroSettings.breakDuration * 60);
    startTimer();
  };

  // Function to format time in mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Function to update settings
  const handleUpdateSettings = (newSettings: Partial<typeof pomodoroSettings>) => {
    updatePomodoroSettings(newSettings);
    setRemainingTime(newSettings.focusDuration ? newSettings.focusDuration * 60 : remainingTime);
    setSettingsDialogOpen(false);
    toast({
      title: "Settings updated",
      description: "Pomodoro settings have been updated successfully.",
    });
  };

  // Add the completed focus session
  const handleCompleteSession = () => {
    const sessionDuration = Math.round((Date.now() - timerStartTime) / 60000);
    
    if (sessionDuration < 1) {
      toast({
        title: "Session too short",
        description: "The session was too short to record.",
      });
      return;
    }
    
    const newSession = {
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: format(new Date(timerStartTime), 'HH:mm'),
      endTime: format(new Date(), 'HH:mm'),
      focusDuration: pomodoroSettings.focusDuration,
      breakDuration: pomodoroSettings.breakDuration,
      completedPomodoros,
      tag: sessionTag,
      duration: sessionDuration,
      type: 'focus'
    };
    
    addFocusSession(newSession);
    
    resetTimer();
    setTimerRunning(false);
    setCompletedPomodoros(0);
    setSessionTag('');
    toast({
      title: "Session recorded",
      description: "Your focus session has been recorded.",
    });
  };

  // Get recent sessions
  const recentSessions = focusSessions
    .sort((a, b) => new Date(b.date + ' ' + b.startTime).getTime() - new Date(a.date + ' ' + a.startTime).getTime())
    .slice(0, 5);

  // Use effect to handle timer logic
  useEffect(() => {
    if (remainingTime <= 0 && isTimerRunning) {
      handleTimerComplete();
    }
  }, [remainingTime, isTimerRunning]);

  // Update timer when settings change
  useEffect(() => {
    resetTimer();
    setRemainingTime(pomodoroSettings.focusDuration * 60);
  }, [pomodoroSettings]);

  // Update the stats section to use focusDuration or duration
  const totalFocusTime = focusSessions.reduce((total, session) => {
    return total + (session.duration || session.focusDuration);
  }, 0);

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Focus Timer</h1>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Stay focused and boost your productivity</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <div className="text-6xl font-bold">{formatTime(remainingTime)}</div>
          <div className="flex items-center space-x-4">
            {!isTimerRunning ? (
              <Button onClick={startTimer} disabled={isTimerRunning}>
                <PlayCircle className="h-5 w-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="secondary">
                <PauseCircle className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={resetTimer} variant="outline">
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
            <Button onClick={handleCompleteSession} variant="destructive">
              <Check className="h-5 w-5 mr-2" />
              Complete
            </Button>
          </div>
          <Input
            type="text"
            placeholder="Session tag (optional)"
            value={sessionTag}
            onChange={(e) => setSessionTag(e.target.value)}
            className="w-full max-w-xs"
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p>Completed Pomodoros: {completedPomodoros}</p>
          <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <Settings2 className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Pomodoro Settings</DialogTitle>
                <DialogDescription>
                  Adjust your focus and break durations here.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="focus">Focus Duration (minutes)</Label>
                  <Slider
                    id="focus"
                    defaultValue={[pomodoroSettings.focusDuration]}
                    max={60}
                    step={1}
                    onValueChange={(value) =>
                      handleUpdateSettings({ focusDuration: value[0] })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {pomodoroSettings.focusDuration} minutes
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break">Break Duration (minutes)</Label>
                  <Slider
                    id="break"
                    defaultValue={[pomodoroSettings.breakDuration]}
                    max={30}
                    step={1}
                    onValueChange={(value) =>
                      handleUpdateSettings({ breakDuration: value[0] })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {pomodoroSettings.breakDuration} minutes
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Your focus session stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Focus Time</span>
              <span className="font-medium">{totalFocusTime} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Sessions Completed</span>
              <span className="font-medium">{focusSessions.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your last focus sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <p className="text-muted-foreground">No sessions recorded yet.</p>
            ) : (
              recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border-b last:border-0"
                >
                  <div>
                    <span className="font-medium">{format(new Date(session.date), 'MMM d')}</span>
                    <span className="text-muted-foreground ml-2">
                      {session.startTime} - {session.endTime || "ongoing"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">{session.duration || session.focusDuration} min</span>
                    {session.tag && (
                      <span className="ml-2 text-xs bg-primary/20 px-2 py-1 rounded-full">
                        {session.tag}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FocusTimer;
