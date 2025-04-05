
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, parseISO } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, CircleDollarSign, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for the dashboard
const mockPerformanceData = [
  { day: 'Mon', focus: 3.5, tasks: 7, expenses: 15 },
  { day: 'Tue', focus: 2, tasks: 5, expenses: 25 },
  { day: 'Wed', focus: 4, tasks: 10, expenses: 10 },
  { day: 'Thu', focus: 3, tasks: 6, expenses: 30 },
  { day: 'Fri', focus: 5, tasks: 8, expenses: 20 },
  { day: 'Sat', focus: 1.5, tasks: 4, expenses: 40 },
  { day: 'Sun', focus: 3, tasks: 6, expenses: 15 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    tasks, 
    focusSessions, 
    transactions,
    themeMode 
  } = useAppStore();

  // Get today's date
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');
  
  // Get the current week
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
  
  // Filter tasks for today
  const todayTasks = tasks.filter(task => {
    const taskDate = parseISO(task.date);
    return isSameDay(taskDate, today);
  });
  
  // Filter tasks for this week
  const weekTasks = tasks.filter(task => {
    const taskDate = parseISO(task.date);
    return taskDate >= startOfCurrentWeek && taskDate <= endOfCurrentWeek;
  });
  
  // Count completed tasks
  const completedTodayTasks = todayTasks.filter(task => task.completed).length;
  const completedWeekTasks = weekTasks.filter(task => task.completed).length;
  
  // Calculate completion rates
  const todayCompletionRate = todayTasks.length > 0 
    ? Math.round((completedTodayTasks / todayTasks.length) * 100) 
    : 0;
    
  const weekCompletionRate = weekTasks.length > 0 
    ? Math.round((completedWeekTasks / weekTasks.length) * 100) 
    : 0;
  
  // Calculate focus time for today and this week
  const todayFocusMinutes = focusSessions
    .filter(session => {
      const sessionDate = new Date(session.date);
      return isSameDay(sessionDate, today);
    })
    .reduce((total, session) => total + session.duration, 0);
    
  const weekFocusMinutes = focusSessions
    .filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfCurrentWeek && sessionDate <= endOfCurrentWeek;
    })
    .reduce((total, session) => total + session.duration, 0);
    
  // Format focus time
  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Calculate expenses for today and this week
  const todayExpenses = transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isSameDay(transactionDate, today);
    })
    .reduce((total, transaction) => {
      return transaction.type === 'expense' 
        ? total + transaction.amount 
        : total;
    }, 0);
    
  const weekExpenses = transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startOfCurrentWeek && transactionDate <= endOfCurrentWeek;
    })
    .reduce((total, transaction) => {
      return transaction.type === 'expense' 
        ? total + transaction.amount 
        : total;
    }, 0);
    
  // Calculate income for today and this week
  const todayIncome = transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isSameDay(transactionDate, today);
    })
    .reduce((total, transaction) => {
      return transaction.type === 'income' 
        ? total + transaction.amount 
        : total;
    }, 0);
    
  const weekIncome = transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startOfCurrentWeek && transactionDate <= endOfCurrentWeek;
    })
    .reduce((total, transaction) => {
      return transaction.type === 'income' 
        ? total + transaction.amount 
        : total;
    }, 0);
    
  // Quick actions for the dashboard
  const quickActions = [
    { 
      title: 'New Task', 
      icon: <CheckCircle2 className="h-5 w-5" />, 
      onClick: () => navigate('/calendar') 
    },
    { 
      title: 'Start Focus', 
      icon: <Clock className="h-5 w-5" />, 
      onClick: () => navigate('/focus-timer') 
    },
    { 
      title: 'Add Expense', 
      icon: <CircleDollarSign className="h-5 w-5" />, 
      onClick: () => navigate('/expense-tracker') 
    },
    { 
      title: 'View Calendar', 
      icon: <Calendar className="h-5 w-5" />, 
      onClick: () => navigate('/calendar') 
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
          {/* Settings link removed to fix error */}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={action.onClick}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  {action.icon}
                </div>
                <p className="font-medium text-sm">{action.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Daily Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tasks</CardTitle>
              <CardDescription>Today's progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {completedTodayTasks} of {todayTasks.length} tasks complete
                  </span>
                  <span className="text-sm font-medium">{todayCompletionRate}%</span>
                </div>
                <Progress value={todayCompletionRate} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/calendar')}>
                View All Tasks
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Focus Time</CardTitle>
              <CardDescription>Today's sessions</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{formatFocusTime(todayFocusMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Weekly: {formatFocusTime(weekFocusMinutes)}</p>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/focus-timer')}>
                Start Session
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Finances</CardTitle>
              <CardDescription>Today's summary</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Income</span>
                  <span className="text-sm font-medium text-green-500">+${todayIncome.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expenses</span>
                  <span className="text-sm font-medium text-red-500">-${todayExpenses.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium">Balance</span>
                  <span className="text-sm font-medium">${(todayIncome - todayExpenses).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/expense-tracker')}>
                Manage Finances
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>Your performance for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="finances">Finances</TabsTrigger>
              </TabsList>
              <TabsContent value="chart">
                <div className="h-80">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={mockPerformanceData}
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
                        />
                        <Area 
                          type="monotone" 
                          dataKey="focus" 
                          name="Focus Hours"
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.2}
                          activeDot={{ r: 8 }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="tasks" 
                          name="Tasks Completed"
                          stroke="#82ca9d" 
                          fill="#82ca9d" 
                          fillOpacity={0.2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expenses" 
                          name="Expenses ($)"
                          stroke="#ffc658" 
                          fill="#ffc658" 
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tasks">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {completedWeekTasks} of {weekTasks.length} tasks complete
                      </span>
                      <span className="text-sm font-medium">{weekCompletionRate}%</span>
                    </div>
                    <Progress value={weekCompletionRate} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    {weekTasks.length > 0 ? (
                      weekTasks.slice(0, 5).map((task) => (
                        <div 
                          key={task.id} 
                          className={`p-3 rounded-md border text-sm
                            ${task.completed ? 'bg-muted/30' : ''}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${task.category}`} />
                              <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(task.date), 'E, MMM d')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-muted-foreground">No tasks scheduled for this week</p>
                    )}
                    
                    {weekTasks.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        + {weekTasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="finances">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-2">Income</div>
                        <div className="text-2xl font-bold text-green-500">+${weekIncome.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-2">Expenses</div>
                        <div className="text-2xl font-bold text-red-500">-${weekExpenses.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="rounded-lg border">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <span className="font-medium">Transaction</span>
                      <span className="font-medium">Amount</span>
                    </div>
                    <div className="divide-y">
                      {transactions.length > 0 ? (
                        transactions
                          .filter(transaction => {
                            const transactionDate = new Date(transaction.date);
                            return transactionDate >= startOfCurrentWeek && transactionDate <= endOfCurrentWeek;
                          })
                          .slice(0, 5)
                          .map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className={`w-2 h-2 rounded-full ${
                                    transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                                  }`} 
                                />
                                <span>{transaction.description}</span>
                              </div>
                              <span 
                                className={`font-medium ${
                                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                                }`}
                              >
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                              </span>
                            </div>
                          ))
                      ) : (
                        <p className="text-center py-6 text-muted-foreground">No transactions for this week</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
