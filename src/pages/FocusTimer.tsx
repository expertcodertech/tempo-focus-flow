
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings as SettingsIcon, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, sub } from 'date-fns';
import { FocusSession } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const FocusTimer = () => {
  const { 
    isTimerRunning, 
    setTimerRunning, 
    pomodoroSettings, 
    updatePomodoroSettings,
    focusSessions,
    addFocusSession,
    themeMode
  } = useAppStore();
  
  // Timer state
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.focusDuration * 60);
  const [currentSession, setCurrentSession] = useState(1);
  
  // Progress calculations
  const totalSeconds = timerMode === 'focus' 
    ? pomodoroSettings.focusDuration * 60 
    : pomodoroSettings.breakDuration * 60;
    
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  
  // Timer settings form state
  const [focusDuration, setFocusDuration] = useState(pomodoroSettings.focusDuration);
  const [breakDuration, setBreakDuration] = useState(pomodoroSettings.breakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(pomodoroSettings.longBreakDuration);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(pomodoroSettings.sessionsBeforeLongBreak);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Reset timer
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerMode('focus');
    setTimeLeft(pomodoroSettings.focusDuration * 60);
    setCurrentSession(1);
  };
  
  // Save settings
  const saveSettings = () => {
    updatePomodoroSettings({
      focusDuration,
      breakDuration,
      longBreakDuration,
      sessionsBeforeLongBreak
    });
    // Reset timer with new settings
    resetTimer();
  };
  
  // Process session complete
  const handleSessionComplete = () => {
    // Record finished focus session
    if (timerMode === 'focus') {
      const newSession: Omit<FocusSession, 'id'> = {
        date: new Date().toISOString(),
        duration: pomodoroSettings.focusDuration, // Duration in minutes
        type: 'focus',
      };
      addFocusSession(newSession);
      
      // Switch to break mode
      if (currentSession % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        // Long break after completing required number of sessions
        setTimerMode('break');
        setTimeLeft(pomodoroSettings.longBreakDuration * 60);
      } else {
        // Regular break
        setTimerMode('break');
        setTimeLeft(pomodoroSettings.breakDuration * 60);
      }
    } else {
      // Break finished, back to focus mode
      setTimerMode('focus');
      setTimeLeft(pomodoroSettings.focusDuration * 60);
      setCurrentSession(currentSession + 1);
    }
  };
  
  // Start next session
  const startNextSession = () => {
    if (timerMode === 'break') {
      // Skip break, start next focus session
      setTimerMode('focus');
      setTimeLeft(pomodoroSettings.focusDuration * 60);
      setCurrentSession(currentSession + 1);
    } else {
      // Skip focus, start break
      if (currentSession % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        setTimerMode('break');
        setTimeLeft(pomodoroSettings.longBreakDuration * 60);
      } else {
        setTimerMode('break');
        setTimeLeft(pomodoroSettings.breakDuration * 60);
      }
    }
    setTimerRunning(false);
  };
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeft === 0) {
      // Timer completed
      setTimerRunning(false);
      // Play sound or notification
      handleSessionComplete();
    }
    
    return () => {
      clearInterval(timer);
    };
  }, [isTimerRunning, timeLeft]);
  
  // Generate session stats for the chart
  const generateSessionStats = () => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      return format(sub(new Date(), { days: 6 - i }), 'EEE');
    });
    
    const stats = last7Days.map(dayLabel => {
      const day = format(sub(new Date(), { days: 6 - last7Days.indexOf(dayLabel) }), 'yyyy-MM-dd');
      
      // Filter sessions for this day
      const dayMinutes = focusSessions
        .filter(session => session.date.startsWith(day))
        .reduce((total, session) => total + session.duration, 0);
        
      return {
        day: dayLabel,
        minutes: dayMinutes
      };
    });
    
    return stats;
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Focus Timer</h1>
          
          <div className="flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SettingsIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Timer Settings</SheetTitle>
                  <SheetDescription>
                    Customize your pomodoro timer settings
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Label>Focus Duration: {focusDuration} min</Label>
                      <span className="text-sm text-muted-foreground">{focusDuration} min</span>
                    </div>
                    <Slider
                      min={1}
                      max={60}
                      step={1}
                      value={[focusDuration]}
                      onValueChange={(value) => setFocusDuration(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Label>Break Duration: {breakDuration} min</Label>
                      <span className="text-sm text-muted-foreground">{breakDuration} min</span>
                    </div>
                    <Slider
                      min={1}
                      max={30}
                      step={1}
                      value={[breakDuration]}
                      onValueChange={(value) => setBreakDuration(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Label>Long Break Duration: {longBreakDuration} min</Label>
                      <span className="text-sm text-muted-foreground">{longBreakDuration} min</span>
                    </div>
                    <Slider
                      min={1}
                      max={60}
                      step={1}
                      value={[longBreakDuration]}
                      onValueChange={(value) => setLongBreakDuration(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Label>Sessions Before Long Break: {sessionsBeforeLongBreak}</Label>
                      <span className="text-sm text-muted-foreground">{sessionsBeforeLongBreak}</span>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[sessionsBeforeLongBreak]}
                      onValueChange={(value) => setSessionsBeforeLongBreak(value[0])}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetTimer}>Reset</Button>
                  <Button onClick={saveSettings}>Save Settings</Button>
                </div>
              </SheetContent>
            </Sheet>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <BarChart className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Focus History</SheetTitle>
                  <SheetDescription>
                    Your focus session statistics
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6">
                  <Tabs defaultValue="chart">
                    <TabsList className="w-full grid grid-cols-2 mb-4">
                      <TabsTrigger value="chart">Chart</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="chart">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={generateSessionStats()}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: themeMode === 'dark' ? '#1f1f1f' : '#ffffff',
                                borderColor: themeMode === 'dark' ? '#2d2d2d' : '#e2e8f0'
                              }} 
                              formatter={(value) => [`${value} min`, 'Focus Time']}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="minutes" 
                              name="Minutes"
                              stroke="#8884d8" 
                              fill="#8884d8" 
                              fillOpacity={0.2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                        
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                          <p>Total focus time this week: {
                            focusSessions.reduce((total, session) => total + session.duration, 0)
                          } minutes</p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="history">
                      <h3 className="text-lg font-medium mb-2">Recent Sessions</h3>
                      
                      <ScrollArea className="h-72">
                        {focusSessions.length > 0 ? (
                          focusSessions
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((session) => (
                              <div key={session.id} className="py-2">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium">
                                      {session.duration} minutes
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(session.date), 'MMM d, yyyy - h:mm a')}
                                    </p>
                                  </div>
                                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10">
                                    {session.type}
                                  </div>
                                </div>
                                <Separator className="mt-2" />
                              </div>
                            ))
                        ) : (
                          <p className="text-center py-8 text-muted-foreground">
                            No focus sessions recorded yet
                          </p>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardHeader className="pb-2 text-center">
            <CardTitle className={`text-2xl ${timerMode === 'focus' ? 'text-primary' : 'text-teal-500'}`}>
              {timerMode === 'focus' ? 'Focus Time' : 'Break Time'}
            </CardTitle>
            <CardDescription>
              Session {currentSession} / {timerMode === 'focus' ? 'Focus' : (
                currentSession % pomodoroSettings.sessionsBeforeLongBreak === 0 ? 'Long Break' : 'Break'
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center py-6">
            <div className="text-6xl font-bold mb-6">
              {formatTime(timeLeft)}
            </div>
            
            <Progress value={progressPercent} className="h-2 w-full mb-6" />
            
            <div className="flex items-center justify-center space-x-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={resetTimer}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="default"
                size="lg"
                className="px-8"
                onClick={() => setTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? (
                  <Pause className="h-5 w-5 mr-2" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                {isTimerRunning ? 'Pause' : 'Start'}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={startNextSession}
              >
                <div className="text-xs">Skip</div>
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0 text-center justify-center text-sm text-muted-foreground">
            {timerMode === 'focus' 
              ? `Stay focused for ${pomodoroSettings.focusDuration} minutes` 
              : `Take a ${timerMode === 'break' && currentSession % pomodoroSettings.sessionsBeforeLongBreak === 0
                  ? 'long break' 
                  : 'short break'} for ${timerMode === 'break' && currentSession % pomodoroSettings.sessionsBeforeLongBreak === 0
                    ? pomodoroSettings.longBreakDuration
                    : pomodoroSettings.breakDuration} minutes`}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default FocusTimer;
