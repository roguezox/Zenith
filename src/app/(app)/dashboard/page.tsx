
'use client';

import * as React from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SpendingBarChart } from '@/components/charts/spending-bar-chart';
import { SpendingPieChart } from '@/components/charts/spending-pie-chart';
import { ArrowUpRight, DollarSign, ListChecks, Target } from 'lucide-react';
import Link from 'next/link';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Expense, Category, BudgetGoal } from '@/types';
import { format } from 'date-fns';

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))", // Fallback to primary
  "hsl(var(--accent))",  // Fallback to accent
];

export default function DashboardPage() {
  // Stabilize initial values for useLocalStorage
  const [initialExpensesArray] = React.useState<Expense[]>([]);
  const [initialCategoriesArray] = React.useState<Category[]>([]);
  const [initialGoalObject] = React.useState<BudgetGoal>({ amount: 75000 }); // Default goal e.g. 75,000 INR

  const [expenses] = useLocalStorage<Expense[]>('expenses', initialExpensesArray);
  const [categories] = useLocalStorage<Category[]>('categories', initialCategoriesArray);
  const [goal] = useLocalStorage<BudgetGoal>('budgetGoal', initialGoalObject); 

  const [currentMonthSpending, setCurrentMonthSpending] = React.useState(0);
  const [remainingBudget, setRemainingBudget] = React.useState(0);
  const [barChartData, setBarChartData] = React.useState<{ name: string; total: number }[]>([]);
  const [pieChartData, setPieChartData] = React.useState<{ name: string; value: number; fill: string }[]>([]);
  const [recentExpenses, setRecentExpenses] = React.useState<Expense[]>([]);


  React.useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const totalSpending = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    setCurrentMonthSpending(totalSpending);
    setRemainingBudget(goal.amount - totalSpending);

    // Prepare bar chart data
    const spendingByCategory: { [key: string]: number } = {};
    monthlyExpenses.forEach(expense => {
      const category = categories.find(c => c.id === expense.categoryId);
      const categoryName = category ? category.name : 'Uncategorized';
      spendingByCategory[categoryName] = (spendingByCategory[categoryName] || 0) + expense.amount;
    });

    const formattedBarData = Object.entries(spendingByCategory)
      .map(([name, total]) => ({ name, total }))
      .sort((a,b) => b.total - a.total);
    setBarChartData(formattedBarData);
    
    // Prepare pie chart data
    const formattedPieData = Object.entries(spendingByCategory)
      .map(([name, value], index) => ({
        name,
        value,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a,b) => b.value - a.value);
    setPieChartData(formattedPieData);

    // Recent expenses
    // Create a new sorted array for recent expenses to avoid mutating the original 'expenses' array from localStorage state
    const sortedExpensesForRecents = [...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentExpenses(sortedExpensesForRecents.slice(0, 5));

  }, [expenses, categories, goal]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };
  
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Dashboard Overview"
        description="Your financial summary and insights."
        action={
          <Button asChild>
            <Link href="/expenses/add">Add New Expense</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending (This Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthSpending)}</div>
            {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget (This Month)</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-destructive' : ''}`}>
              {formatCurrency(remainingBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              Goal: {formatCurrency(goal.amount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <Link href="/categories" className="text-xs text-muted-foreground hover:text-primary">
              Manage categories
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SpendingBarChart data={barChartData} currency="INR" />
        </div>
        <div className="lg:col-span-3">
          <SpendingPieChart data={pieChartData} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest 5 recorded expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentExpenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{getCategoryName(expense.categoryId)}</TableCell>
                    <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-muted-foreground text-center py-4">No recent transactions found. <Link href="/expenses/add" className="text-primary hover:underline">Add one now</Link>!</p>
          )}
        </CardContent>
        {recentExpenses.length > 0 && (
          <CardContent className="border-t pt-4">
             <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <Link href="/expenses">View All Transactions <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
             </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
