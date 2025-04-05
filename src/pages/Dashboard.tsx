
import { useEffect, useState } from 'react';
import { CalendarDays, Clock, DollarSign, Calendar, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import { Link } from 'react-router-dom';

const TaskWidget = () => {
  const { tasks } = useAppStore();
  const todaysTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });
  
  return (
    <Card className="col-span-1 row-span-1 h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-primary" /> 
            Today's Tasks
          </CardTitle>
          <Link to="/calendar">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
              View All
            </Button>
          </Link>
        </div>
        <CardDescription>
          {format(new Date(), 'MMMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {todaysTasks.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No tasks for today</p>
            <Link to="/calendar">
              <Button variant="outline" size="sm" className="mt-2">
                Add Task
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {todaysTasks.slice(0, 5).map((task) => (
              <li 
                key={task.id} 
                className={`
                  p-3 rounded-md bg-muted/40 flex items-center justify-between
                  task-category-${task.category} task-priority-${task.priority}
                `}
              >
                <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                  {task.title}
                </span>
                {task.startTime && (
                  <span className="text-xs text-muted-foreground">
                    {task.startTime}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const FocusWidget = () => {
  const { focusSessions, isTimerRunning } = useAppStore();
  
  // Get today's focus sessions
  const todaySessions = focusSessions.filter(session => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    return (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()
    );
  });
  
  // Calculate total focus time today
  const totalFocusMinutes = todaySessions.reduce(
    (total, session) => total + session.focusDuration * session.completedPomodoros,
    0
  );
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <Card className="col-span-1 row-span-1">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" /> 
            Focus Time
          </CardTitle>
          <Link to="/focus">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
              Start Session
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-primary">
              {formatTime(totalFocusMinutes)}
            </h3>
            <p className="text-muted-foreground text-sm">Today's Focus Time</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium">
              Sessions completed today: {todaySessions.length}
            </p>
          </div>

          <Link to="/focus" className="w-full mt-2">
            <Button className="w-full" variant="outline">
              {isTimerRunning ? 'Resume Session' : 'Start Focusing'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const ExpensesWidget = () => {
  const { transactions } = useAppStore();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Filter transactions for the current month
  const monthlyTransactions = transactions.filter(transaction => {
    const transDate = new Date(transaction.date);
    return transDate.getMonth() === currentMonth && 
           transDate.getFullYear() === currentYear;
  });
  
  // Calculate total income and expenses
  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;
  
  return (
    <Card className="col-span-1 row-span-1">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" /> 
            Financial Summary
          </CardTitle>
          <Link to="/expenses">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
              View Details
            </Button>
          </Link>
        </div>
        <CardDescription>
          {format(new Date(), 'MMMM yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-muted/40 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="text-xl font-bold text-green-500">${income.toFixed(2)}</p>
            </div>
            <div className="bg-muted/40 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-xl font-bold text-red-500">${expenses.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-muted/40 p-3 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${balance.toFixed(2)}
            </p>
          </div>
          
          <Link to="/expenses" className="block">
            <Button className="w-full" variant="outline">Add Transaction</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const CalendarWidget = () => {
  const { tasks } = useAppStore();
  const [currentDate] = useState(new Date());
  
  // Get tasks for the next 5 days
  const upcoming = tasks.filter(task => {
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);
    fiveDaysFromNow.setHours(23, 59, 59, 999);
    
    return taskDate >= today && taskDate <= fiveDaysFromNow && !task.completed;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <Card className="col-span-1 row-span-1">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" /> 
            Upcoming
          </CardTitle>
          <Link to="/calendar">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
              Calendar
            </Button>
          </Link>
        </div>
        <CardDescription>
          Next 5 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No upcoming tasks</p>
            <Link to="/calendar">
              <Button variant="outline" size="sm" className="mt-2">
                Schedule Task
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.slice(0, 5).map((task) => (
              <li key={task.id} className="flex flex-col p-3 rounded-md bg-muted/40 task-category-${task.category}">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${task.priority === 'high' ? 'text-destructive' : ''}`}>
                    {task.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(task.date), 'MMM dd')}
                  </span>
                </div>
                {task.startTime && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const QuickActions = () => {
  return (
    <Card className="col-span-1 row-span-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Link to="/calendar" className="w-full">
          <Button variant="outline" className="w-full flex items-center justify-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </Link>
        <Link to="/focus" className="w-full">
          <Button variant="outline" className="w-full flex items-center justify-center">
            <Clock className="mr-2 h-4 w-4" />
            Start Timer
          </Button>
        </Link>
        <Link to="/expenses" className="w-full">
          <Button variant="outline" className="w-full flex items-center justify-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
        <Link to="/settings" className="w-full">
          <Button variant="outline" className="w-full flex items-center justify-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TaskWidget />
        <FocusWidget />
        <ExpensesWidget />
        <CalendarWidget />
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
