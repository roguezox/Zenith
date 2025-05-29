'use client';

import * as React from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Goal as GoalIcon, Edit3, DollarSign } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { BudgetGoal, Expense } from '@/types';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const goalSchema = z.object({
  amount: z.coerce.number().positive({ message: "Budget goal must be a positive number." }).min(1, { message: "Goal amount must be at least $1."}),
});
type GoalFormData = z.infer<typeof goalSchema>;

export default function GoalsPage() {
  const [goal, setGoal] = useLocalStorage<BudgetGoal>('budgetGoal', { amount: 1000 }); // Default goal $1000
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const [isEditing, setIsEditing] = React.useState(false);
  const { toast } = useToast();

  const [currentMonthSpending, setCurrentMonthSpending] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

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

    if (goal.amount > 0) {
      setProgress(Math.min((totalSpending / goal.amount) * 100, 100));
    } else {
      setProgress(0);
    }
  }, [expenses, goal]);


  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: { amount: goal.amount },
  });
  
  React.useEffect(() => {
    form.reset({ amount: goal.amount });
  }, [goal, form, isEditing]);

  const handleSetGoal: SubmitHandler<GoalFormData> = (data) => {
    setGoal({ amount: data.amount });
    toast({ title: "Budget Goal Updated", description: `Your monthly budget goal is now ${formatCurrency(data.amount)}.` });
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Budget Goals"
        description="Set and track your monthly spending goals."
        icon={GoalIcon}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Monthly Budget Goal</CardTitle>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Goal
              </Button>
            )}
          </div>
          <CardDescription>
            Set a target for your total monthly spending to stay on track.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSetGoal)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Budget Amount (USD)</FormLabel>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input type="number" step="1" placeholder="e.g., 2000" {...field} className="max-w-xs"/>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit">Save Goal</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary">{formatCurrency(goal.amount)}</div>
              <p className="text-muted-foreground">This is your spending limit for the current month.</p>
              
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Spent: {formatCurrency(currentMonthSpending)}</span>
                  <span>Remaining: {formatCurrency(Math.max(0, goal.amount - currentMonthSpending))}</span>
                </div>
                <Progress value={progress} className="w-full h-3" />
                <p className="mt-1 text-xs text-muted-foreground text-right">{progress.toFixed(1)}% of budget used</p>
              </div>

            </div>
          )}
        </CardContent>
        {!isEditing && goal.amount <=0 && (
            <CardFooter>
                <p className="text-sm text-destructive">
                    Set a budget goal greater than $0 to enable progress tracking.
                </p>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
