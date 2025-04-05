
import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, parseISO } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useAppStore } from '@/store';
import { Task, CalendarView } from '@/types';

const Calendar = () => {
  const { tasks, addTask, updateTask, deleteTask, calendarView, setCalendarView } = useAppStore();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  
  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDate, setTaskDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [taskStartTime, setTaskStartTime] = useState('');
  const [taskEndTime, setTaskEndTime] = useState('');
  const [taskCategory, setTaskCategory] = useState<'study' | 'freelance' | 'break' | 'personal'>('study');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Reset task form
  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskDate(format(selectedDate, 'yyyy-MM-dd'));
    setTaskStartTime('');
    setTaskEndTime('');
    setTaskCategory('study');
    setTaskPriority('medium');
  };
  
  // Handle date change based on view
  const handleDateChange = (direction: 'prev' | 'next') => {
    let newDate = new Date(selectedDate);
    
    switch (calendarView) {
      case 'day':
        newDate = direction === 'prev' 
          ? addDays(selectedDate, -1) 
          : addDays(selectedDate, 1);
        break;
      case 'week':
        newDate = direction === 'prev' 
          ? addDays(selectedDate, -7) 
          : addDays(selectedDate, 7);
        break;
    }
    
    setSelectedDate(newDate);
  };
  
  // Get week days for week view
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    
    const days = [];
    let day = start;
    
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  };
  
  // Get tasks for selected date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return isSameDay(taskDate, date);
    }).sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
  };
  
  // Handle task creation
  const handleCreateTask = () => {
    if (!taskTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Task title required',
        description: 'Please enter a task title',
      });
      return;
    }
    
    const newTask: Omit<Task, 'id'> = {
      title: taskTitle,
      description: taskDescription,
      date: taskDate,
      startTime: taskStartTime || undefined,
      endTime: taskEndTime || undefined,
      category: taskCategory,
      priority: taskPriority,
      completed: false,
    };
    
    addTask(newTask);
    setNewTaskDialogOpen(false);
    resetTaskForm();
    
    toast({
      title: 'Task created',
      description: `"${taskTitle}" has been added to your calendar.`,
    });
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (task: Task) => {
    updateTask(task.id, { completed: !task.completed });
    
    toast({
      title: task.completed ? 'Task marked as incomplete' : 'Task completed',
      description: `"${task.title}" has been updated.`,
    });
  };
  
  // Render day view
  const renderDayView = () => {
    const tasksForDay = getTasksForDate(selectedDate);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {format(selectedDate, 'EEEE, MMMM d')}
            {isToday(selectedDate) && (
              <span className="ml-2 text-sm bg-primary text-primary-foreground px-2 py-1 rounded-md">
                Today
              </span>
            )}
          </h2>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedDate(new Date());
              }}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {tasksForDay.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tasks for this day</p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    resetTaskForm();
                    setTaskDate(format(selectedDate, 'yyyy-MM-dd'));
                    setNewTaskDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasksForDay.map((task) => (
                  <div 
                    key={task.id}
                    className={`
                      p-4 rounded-md border border-border
                      task-category-${task.category}
                      ${task.completed ? 'bg-muted/30' : 'bg-card hover:bg-muted/10'}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 rounded-full mr-2
                              ${task.completed ? 'text-primary' : 'text-muted-foreground'}
                            `}
                            onClick={() => toggleTaskCompletion(task)}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                          
                          <h3 className={`font-medium task-priority-${task.priority}
                            ${task.completed ? 'line-through text-muted-foreground' : ''}
                          `}>
                            {task.title}
                          </h3>
                        </div>
                        
                        {task.description && (
                          <p className={`text-sm text-muted-foreground pl-8
                            ${task.completed ? 'line-through' : ''}
                          `}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      {task.startTime && (
                        <div className="text-sm text-muted-foreground">
                          {task.startTime}
                          {task.endTime && ` - ${task.endTime}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-end">
            <Button
              variant="default"
              onClick={() => {
                resetTaskForm();
                setTaskDate(format(selectedDate, 'yyyy-MM-dd'));
                setNewTaskDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {format(weekDays[0], 'MMM d')} - {format(weekDays[weekDays.length - 1], 'MMM d, yyyy')}
          </h2>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedDate(new Date());
              }}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isCurrentDay = isToday(day);
            const tasksForDay = getTasksForDate(day);
            
            return (
              <Card 
                key={day.toString()} 
                className={`
                  ${isSameDay(day, selectedDate) ? 'border-primary' : ''}
                  ${isCurrentDay ? 'bg-muted/30' : ''}
                `}
              >
                <CardHeader className="p-3 pb-1">
                  <div className="flex flex-col items-center">
                    <CardDescription>
                      {format(day, 'EEE')}
                    </CardDescription>
                    <CardTitle 
                      className={`
                        text-xl
                        ${isCurrentDay ? 'text-primary' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  <div 
                    className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin"
                    onClick={() => setSelectedDate(day)}
                  >
                    {tasksForDay.length === 0 ? (
                      <div className="text-center py-2 text-xs text-muted-foreground">
                        No tasks
                      </div>
                    ) : (
                      tasksForDay.map((task) => (
                        <div
                          key={task.id}
                          className={`
                            px-2 py-1 text-xs rounded 
                            task-category-${task.category}
                            ${task.completed ? 'line-through text-muted-foreground' : ''}
                          `}
                        >
                          {task.title}
                          {task.startTime && (
                            <div className="text-[10px] text-muted-foreground">
                              {task.startTime}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-2 pt-0 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={() => {
                      resetTaskForm();
                      setSelectedDate(day);
                      setTaskDate(format(day, 'yyyy-MM-dd'));
                      setNewTaskDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Update task date when selected date changes
  useEffect(() => {
    setTaskDate(format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate]);
  
  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        
        <div className="flex items-center space-x-4">
          <Select
            value={calendarView}
            onValueChange={(value) => setCalendarView(value as CalendarView)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => {
              resetTaskForm();
              setNewTaskDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
      
      {calendarView === 'day' ? renderDayView() : renderWeekView()}
      
      <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your calendar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Task description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={taskCategory}
                  onValueChange={(value) => setTaskCategory(value as any)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time (optional)</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={taskStartTime}
                  onChange={(e) => setTaskStartTime(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time (optional)</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={taskEndTime}
                  onChange={(e) => setTaskEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={taskPriority}
                onValueChange={(value) => setTaskPriority(value as any)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewTaskDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
