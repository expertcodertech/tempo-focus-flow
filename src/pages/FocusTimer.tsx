
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Settings, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store';

const FocusTimer = () => {
  const {
    pomodoroSettings,
    updatePomodoroSettings,
    addFocusSession,
    focusSessions,
    isTimerRunning,
    setTimerRunning,
  } = useAppStore();
  
  const { toast } = useToast();
  
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.focusDuration * 60);
  const [mode, setMode] = useState<'focus' | 'break' | 'longBreak'>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessionTag, setSessionTag] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);
  
  // Set up the timer based on the mode
  const setupTimer = (timerMode: 'focus' | 'break' | 'longBreak') => {
    let duration = 0;
    
    switch (timerMode) {
      case 'focus':
        duration = pomodoroSettings.focusDuration * 60;
        break;
      case 'break':
        duration = pomodoroSettings.breakDuration * 60;
        break;
      case 'longBreak':
        duration = pomodoroSettings.longBreakDuration * 60;
        break;
    }
    
    setTimeLeft(duration);
    setMode(timerMode);
  };
  
  // Start the timer
  const startTimer = () => {
    if (!isTimerRunning) {
      // If starting a new focus session, record the start time
      if (mode === 'focus' && timeLeft === pomodoroSettings.focusDuration * 60) {
        sessionStartTimeRef.current = new Date();
      }
      
      setTimerRunning(true);
    }
  };
  
  // Pause the timer
  const pauseTimer = () => {
    setTimerRunning(false);
  };
  
  // Reset the timer
  const resetTimer = () => {
    setTimerRunning(false);
    setupTimer(mode);
    sessionStartTimeRef.current = null;
  };
  
  // Complete a session
  const completeSession = () => {
    if (mode === 'focus' && sessionStartTimeRef.current) {
      const now = new Date();
      const startTime = sessionStartTimeRef.current;
      
      // Add to focus sessions
      addFocusSession({
        date: format(now, 'yyyy-MM-dd'),
        startTime: format(startTime, 'HH:mm:ss'),
        endTime: format(now, 'HH:mm:ss'),
        focusDuration: pomodoroSettings.focusDuration,
        breakDuration: mode === 'break' ? pomodoroSettings.breakDuration : pomodoroSettings.longBreakDuration,
        completedPomodoros: 1,
        tag: sessionTag || undefined,
      });
      
      // Show completion toast
      toast({
        title: 'Session completed!',
        description: `You focused for ${pomodoroSettings.focusDuration} minutes.`,
      });
      
      // Update sessions completed count
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      // Determine if we need a long break
      if (newSessionsCompleted % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        setupTimer('longBreak');
        toast({
          title: 'Take a long break!',
          description: `Time for a ${pomodoroSettings.longBreakDuration} minute break.`,
        });
      } else {
        setupTimer('break');
        toast({
          title: 'Take a short break!',
          description: `Time for a ${pomodoroSettings.breakDuration} minute break.`,
        });
      }
      
      // Reset session start time
      sessionStartTimeRef.current = null;
    } else if (mode === 'break' || mode === 'longBreak') {
      setupTimer('focus');
      toast({
        title: 'Break completed!',
        description: 'Ready to focus again?',
      });
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    let totalSeconds = 0;
    
    switch (mode) {
      case 'focus':
        totalSeconds = pomodoroSettings.focusDuration * 60;
        break;
      case 'break':
        totalSeconds = pomodoroSettings.breakDuration * 60;
        break;
      case 'longBreak':
        totalSeconds = pomodoroSettings.longBreakDuration * 60;
        break;
    }
    
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };
  
  // Get today's focus data
  const getTodaysFocusData = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaySessions = focusSessions.filter(session => session.date === today);
    
    const totalMinutes = todaySessions.reduce(
      (total, session) => total + session.focusDuration * session.completedPomodoros,
      0
    );
    
    const sessionsCount = todaySessions.length;
    
    return { totalMinutes, sessionsCount };
  };
  
  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer is done
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            completeSession();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);
  
  // Initial timer setup
  useEffect(() => {
    setupTimer('focus');
  }, [pomodoroSettings]);
  
  // Get today's focus data
  const todaysFocus = getTodaysFocusData();
  
  return (
    <div className="container mx-auto max-w-4xl py-6">
      <h1 className="text-3xl font-bold mb-6">Focus Timer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className={`
              ${mode === 'focus' ? 'bg-blue-500/10' : ''}
              ${mode === 'break' ? 'bg-green-500/10' : ''}
              ${mode === 'longBreak' ? 'bg-purple-500/10' : ''}
            `}>
              <CardTitle className="text-xl flex justify-center">
                {mode === 'focus' && 'Focus Session'}
                {mode === 'break' && 'Short Break'}
                {mode === 'longBreak' && 'Long Break'}
              </CardTitle>
              <CardDescription className="text-center">
                Session {sessionsCompleted + 1} • {sessionTag ? `Tag: ${sessionTag}` : 'No tag'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg className="w-64 h-64">
                    <circle
                      className="text-muted/20 stroke-2"
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      strokeWidth="8"
                      stroke="currentColor"
                    />
                    <circle
                      className={`
                        ${mode === 'focus' ? 'text-blue-500' : ''}
                        ${mode === 'break' ? 'text-green-500' : ''}
                        ${mode === 'longBreak' ? 'text-purple-500' : ''}
                        stroke-2 transition-all duration-200
                      `}
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      strokeWidth="8"
                      stroke="currentColor"
                      strokeDasharray={2 * Math.PI * 120}
                      strokeDashoffset={
                        2 * Math.PI * 120 * (1 - calculateProgress() / 100)
                      }
                      transform="rotate(-90 128 128)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-5xl font-bold">{formatTime(timeLeft)}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4 mt-6">
                {!isTimerRunning ? (
                  <Button
                    size="lg"
                    className="w-16 h-16 rounded-full"
                    onClick={startTimer}
                  >
                    <Play className="h-8 w-8" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-16 h-16 rounded-full"
                    onClick={pauseTimer}
                  >
                    <Pause className="h-8 w-8" />
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="w-12 h-12 rounded-full"
                  onClick={resetTimer}
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Add a tag for this session"
                    value={sessionTag}
                    onChange={(e) => setSessionTag(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" onClick={() => completeSession()}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Skip
              </Button>
            </CardFooter>
          </Card>
          
          {showSettings && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Timer Settings</CardTitle>
                <CardDescription>Customize your focus and break durations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Focus Duration: {pomodoroSettings.focusDuration} minutes</Label>
                    <Slider
                      value={[pomodoroSettings.focusDuration]}
                      min={5}
                      max={60}
                      step={5}
                      onValueChange={(value) => updatePomodoroSettings({ focusDuration: value[0] })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Short Break: {pomodoroSettings.breakDuration} minutes</Label>
                    <Slider
                      value={[pomodoroSettings.breakDuration]}
                      min={1}
                      max={15}
                      step={1}
                      onValueChange={(value) => updatePomodoroSettings({ breakDuration: value[0] })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Long Break: {pomodoroSettings.longBreakDuration} minutes</Label>
                    <Slider
                      value={[pomodoroSettings.longBreakDuration]}
                      min={5}
                      max={30}
                      step={5}
                      onValueChange={(value) => updatePomodoroSettings({ longBreakDuration: value[0] })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sessions before long break: {pomodoroSettings.sessionsBeforeLongBreak}</Label>
                    <Slider
                      value={[pomodoroSettings.sessionsBeforeLongBreak]}
                      min={1}
                      max={8}
                      step={1}
                      onValueChange={(value) => updatePomodoroSettings({ sessionsBeforeLongBreak: value[0] })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Today's Focus</CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, MMMM d')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 rounded-lg bg-muted/20">
                <h3 className="text-4xl font-bold text-primary mb-1">
                  {todaysFocus.totalMinutes}
                </h3>
                <p className="text-muted-foreground">Minutes focused</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/20">
                <h3 className="text-4xl font-bold text-primary mb-1">
                  {todaysFocus.sessionsCount}
                </h3>
                <p className="text-muted-foreground">Sessions completed</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Recent Sessions</h3>
                
                {focusSessions.length > 0 ? (
                  <Tabs defaultValue="today">
                    <TabsList className="w-full">
                      <TabsTrigger value="today" className="flex-1">Today</TabsTrigger>
                      <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    </TabsList>
                    <TabsContent value="today">
                      <ul className="space-y-2 mt-2">
                        {focusSessions
                          .filter(session => session.date === format(new Date(), 'yyyy-MM-dd'))
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 5)
                          .map((session, index) => (
                            <li key={index} className="text-sm p-2 bg-muted/20 rounded-md">
                              <div className="flex justify-between">
                                <span>
                                  {session.startTime.substring(0, 5)}
                                </span>
                                <span>
                                  {session.focusDuration} min
                                </span>
                              </div>
                              {session.tag && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {session.tag}
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="all">
                      <ul className="space-y-2 mt-2">
                        {focusSessions
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 5)
                          .map((session, index) => (
                            <li key={index} className="text-sm p-2 bg-muted/20 rounded-md">
                              <div className="flex justify-between">
                                <span>
                                  {format(new Date(session.date), 'MMM dd')}
                                </span>
                                <span>
                                  {session.focusDuration} min
                                </span>
                              </div>
                              {session.tag && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {session.tag}
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    <p>No sessions yet</p>
                    <p className="text-sm">Complete a focus timer to see it here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
