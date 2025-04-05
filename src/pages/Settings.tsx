
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/store";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { 
    themeMode, 
    setThemeMode,
    pomodoroSettings,
    updatePomodoroSettings,
  } = useAppStore();
  
  const { toast } = useToast();
  
  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.removeItem('tempo-focus-flow-storage');
      window.location.reload();
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="focus" className="flex-1">Focus Timer</TabsTrigger>
          <TabsTrigger value="data" className="flex-1">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how TempoFocus looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={themeMode === 'dark'}
                  onCheckedChange={(checked) => {
                    const newMode = checked ? 'dark' : 'light';
                    setThemeMode(newMode);
                    
                    if (newMode === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                    
                    toast({
                      title: `${newMode === 'dark' ? 'Dark' : 'Light'} mode enabled`,
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="focus">
          <Card>
            <CardHeader>
              <CardTitle>Focus Timer Settings</CardTitle>
              <CardDescription>
                Customize your focus sessions and breaks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Focus Duration: {pomodoroSettings.focusDuration} minutes</Label>
                <Slider
                  value={[pomodoroSettings.focusDuration]}
                  min={5}
                  max={60}
                  step={5}
                  onValueChange={(value) => {
                    updatePomodoroSettings({ focusDuration: value[0] });
                    toast({
                      title: "Focus duration updated",
                      description: `Focus duration set to ${value[0]} minutes`,
                    });
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Short Break: {pomodoroSettings.breakDuration} minutes</Label>
                <Slider
                  value={[pomodoroSettings.breakDuration]}
                  min={1}
                  max={15}
                  step={1}
                  onValueChange={(value) => {
                    updatePomodoroSettings({ breakDuration: value[0] });
                    toast({
                      title: "Break duration updated",
                      description: `Break duration set to ${value[0]} minutes`,
                    });
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Long Break: {pomodoroSettings.longBreakDuration} minutes</Label>
                <Slider
                  value={[pomodoroSettings.longBreakDuration]}
                  min={5}
                  max={30}
                  step={5}
                  onValueChange={(value) => {
                    updatePomodoroSettings({ longBreakDuration: value[0] });
                    toast({
                      title: "Long break duration updated",
                      description: `Long break duration set to ${value[0]} minutes`,
                    });
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Sessions before long break: {pomodoroSettings.sessionsBeforeLongBreak}</Label>
                <Slider
                  value={[pomodoroSettings.sessionsBeforeLongBreak]}
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={(value) => {
                    updatePomodoroSettings({ sessionsBeforeLongBreak: value[0] });
                    toast({
                      title: "Session count updated",
                      description: `You'll get a long break after ${value[0]} focus sessions`,
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Export Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your data in JSON format for backup
                </p>
                <Button
                  onClick={() => {
                    const data = localStorage.getItem('tempo-focus-flow-storage');
                    
                    if (data) {
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `tempofocus-backup-${new Date().toISOString().slice(0, 10)}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      toast({
                        title: "Data exported successfully",
                      });
                    }
                  }}
                >
                  Export Data
                </Button>
              </div>
              
              <div className="pt-4 border-t border-border">
                <h3 className="font-medium mb-2 text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions are permanent and cannot be undone
                </p>
                <Button variant="destructive" onClick={handleClearData}>
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
