'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Edit3, CalendarIcon, Wand2 } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Expense, Category } from '@/types';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { smartCategorizeTransaction } from '@/ai/flows/categorize-transaction';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const expenseSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  description: z.string().min(1, { message: "Description cannot be empty." }).max(200, { message: "Description too long." }),
});
type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;

  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [categories] = useLocalStorage<Category[]>('categories', []);
  const { toast } = useToast();
  const [isCategorizing, setIsCategorizing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date(),
      categoryId: '',
      amount: undefined,
      description: '',
    },
  });

  React.useEffect(() => {
    const expenseToEdit = expenses.find(exp => exp.id === expenseId);
    if (expenseToEdit) {
      form.reset({
        date: parseISO(expenseToEdit.date),
        categoryId: expenseToEdit.categoryId,
        amount: expenseToEdit.amount,
        description: expenseToEdit.description,
      });
    } else if (expenses.length > 0) { // Only redirect if expenses have loaded and item not found
      toast({ title: "Error", description: "Expense not found.", variant: "destructive"});
      router.replace('/expenses');
    }
    setIsLoading(false);
  }, [expenseId, expenses, form, router, toast]);

  const handleUpdateExpense: SubmitHandler<ExpenseFormData> = (data) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(exp =>
        exp.id === expenseId
          ? {
              ...exp,
              date: format(data.date, 'yyyy-MM-dd'),
              categoryId: data.categoryId,
              amount: data.amount,
              description: data.description,
            }
          : exp
      )
    );
    toast({ title: "Expense Updated", description: `"${data.description}" has been updated.` });
    router.push('/expenses');
  };
  
  const handleSuggestCategory = async () => {
    const description = form.getValues('description');
    if (!description.trim()) {
      toast({ title: "Missing Description", description: "Please enter a description to suggest a category.", variant: "destructive" });
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await smartCategorizeTransaction({ transactionDescription: description });
      const suggestedCategoryName = result.category;
      const matchedCategory = categories.find(cat => cat.name.toLowerCase() === suggestedCategoryName.toLowerCase());
      
      if (matchedCategory) {
        form.setValue('categoryId', matchedCategory.id, { shouldValidate: true });
        toast({ title: "Category Suggested", description: `Suggested: ${matchedCategory.name}`});
      } else {
         toast({ title: "Suggestion Not Found", description: `AI suggested "${suggestedCategoryName}", but it's not in your categories. You can add it or choose another.`, duration: 5000 });
      }
    } catch (error) {
      console.error("Error suggesting category:", error);
      toast({ title: "Suggestion Failed", description: "Could not get category suggestion.", variant: "destructive" });
    } finally {
      setIsCategorizing(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><p>Loading expense details...</p></div>;
  }

  if (!form.getValues('description') && !isLoading) { // Check if form has data after loading
     return <div className="flex h-full items-center justify-center"><p>Expense not found or could not be loaded.</p></div>;
  }


  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Edit Expense"
        description="Update the details of your spending transaction."
        icon={Edit3}
      />
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>Modify the form below to update your expense.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateExpense)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Coffee with client, Monthly gym membership" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               {form.getValues('description') && (
                <Button type="button" variant="outline" size="sm" onClick={handleSuggestCategory} disabled={isCategorizing}>
                  <Wand2 className={cn("mr-2 h-4 w-4", isCategorizing && "animate-spin")} />
                  {isCategorizing ? 'Suggesting...' : 'Suggest Category (AI)'}
                </Button>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {categories.length > 0 ? (
                            categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-muted-foreground">No categories available. <Link href="/categories" className="text-primary hover:underline">Add categories first.</Link></div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Expense</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={categories.length === 0}>Save Changes</Button>
              </div>
               {categories.length === 0 && (
                  <p className="text-sm text-destructive text-right">
                      You must <Link href="/categories" className="underline">add at least one category</Link> before editing expenses.
                  </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

