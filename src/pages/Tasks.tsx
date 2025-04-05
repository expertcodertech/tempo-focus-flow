
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Plus, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store';

const Tasks = () => {
  const { tasks, updateTask, deleteTask } = useAppStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  
  const toggleTaskCompletion = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed: !completed });
    
    toast({
      title: completed ? 'Task marked as incomplete' : 'Task completed',
      description: 'Your task status has been updated.',
    });
  };
  
  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
      
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted.',
      });
    }
  };
  
  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });
  
  // Group tasks by category
  const groupedTasks: Record<string, typeof tasks> = {
    study: [],
    freelance: [],
    personal: [],
    break: [],
  };
  
  filteredTasks.forEach(task => {
    if (!groupedTasks[task.category]) {
      groupedTasks[task.category] = [];
    }
    groupedTasks[task.category].push(task);
  });
  
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        
        <div className="flex items-center space-x-2">
          <Tabs 
            value={filter} 
            onValueChange={(value) => setFilter(value as typeof filter)}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button asChild>
            <a href="/calendar">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </a>
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([category, categoryTasks]) => {
          if (categoryTasks.length === 0) return null;
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">
                  {category}
                </CardTitle>
                <CardDescription>
                  {categoryTasks.length} task{categoryTasks.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`
                        p-4 rounded-md border flex items-center justify-between
                        task-category-${task.category}
                        ${task.completed ? 'bg-muted/30' : 'bg-card hover:bg-muted/10'}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 rounded-full
                            ${task.completed ? 'text-primary' : 'text-muted-foreground'}
                          `}
                          onClick={() => toggleTaskCompletion(task.id, task.completed)}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                        
                        <div className="space-y-1">
                          <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </div>
                          
                          {task.description && (
                            <p className={`text-sm text-muted-foreground ${task.completed ? 'line-through' : ''}`}>
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>
                              {format(parseISO(task.date), 'MMM d, yyyy')}
                            </span>
                            
                            {task.startTime && (
                              <span>
                                {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                              </span>
                            )}
                            
                            <span className={`task-priority-${task.priority}`}>
                              {task.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks found</p>
            <Button className="mt-4" asChild>
              <a href="/calendar">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
