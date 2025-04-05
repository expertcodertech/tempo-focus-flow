
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store';
import { ExpenseCategory, Transaction } from '@/types';

const ExpenseTracker = () => {
  const { transactions, addTransaction, deleteTransaction } = useAppStore();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  const categories: { value: ExpenseCategory, label: string }[] = [
    { value: 'food', label: 'Food' },
    { value: 'transport', label: 'Transport' },
    { value: 'housing', label: 'Housing' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'other', label: 'Other' },
  ];

  // Get current month's transactions
  const currentDate = new Date();
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = parseISO(transaction.date);
    return transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth;
  });
  
  // Calculate totals
  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  
  // Add a new transaction
  const handleAddTransaction = () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Description required',
        description: 'Please enter a description',
      });
      return;
    }
    
    const newTransaction: Omit<Transaction, 'id'> = {
      date,
      amount: numAmount,
      type,
      category,
      description,
    };
    
    addTransaction(newTransaction);
    
    // Reset form
    setAmount('');
    setDescription('');
    setCategory('other');
    setType('expense');
    
    toast({
      title: 'Transaction added',
      description: `${type === 'income' ? 'Income' : 'Expense'} of $${numAmount.toFixed(2)} added successfully.`,
    });
  };
  
  // Get category expenses
  const getCategoryExpenses = () => {
    const categoryTotals: Record<string, number> = {};
    
    categories.forEach((cat) => {
      categoryTotals[cat.value] = 0;
    });
    
    currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] += t.amount;
      });
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .filter((item) => item.amount > 0);
  };
  
  const categoryExpenses = getCategoryExpenses();
  
  return (
    <div className="container mx-auto max-w-4xl py-6">
      <h1 className="text-3xl font-bold mb-6">Expense Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Transaction</CardTitle>
              <CardDescription>
                Record your income or expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transaction-type">Transaction Type</Label>
                  <RadioGroup
                    id="transaction-type"
                    value={type}
                    onValueChange={(value) => setType(value as 'income' | 'expense')}
                    className="flex mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income" id="income" />
                      <Label htmlFor="income" className="text-green-500">Income</Label>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <RadioGroupItem value="expense" id="expense" />
                      <Label htmlFor="expense" className="text-red-500">Expense</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={category} 
                      onValueChange={(value) => setCategory(value as ExpenseCategory)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="E.g., Grocery shopping"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddTransaction} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> 
                Add Transaction
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                {format(new Date(), 'MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentMonthTransactions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm">Add your first transaction above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentMonthTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-3 rounded-md bg-muted/40"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-10 rounded-full mr-3
                              ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}
                            `}
                          />
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span>{format(parseISO(transaction.date), 'MMM dd')}</span>
                              <span className="mx-1">•</span>
                              <span className="capitalize">{transaction.category}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <span
                            className={`font-medium
                              ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}
                            `}
                          >
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              deleteTransaction(transaction.id);
                              toast({ title: 'Transaction deleted' });
                            }}
                            className="ml-2 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>
                {format(new Date(), 'MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="bg-green-500/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Income</p>
                  <p className="text-2xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
                </div>
                
                <div className="bg-red-500/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-2xl font-bold text-red-500">${totalExpenses.toFixed(2)}</p>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${balance.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Expense Categories</h3>
                
                {categoryExpenses.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    <p>No expenses yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categoryExpenses.map(({ category, amount }) => {
                      const percentage = Math.round((amount / totalExpenses) * 100) || 0;
                      const categoryLabel = categories.find(c => c.value === category)?.label || category;
                      
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{categoryLabel}</span>
                            <span>${amount.toFixed(2)} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-muted h-2 rounded-full">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
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

export default ExpenseTracker;
