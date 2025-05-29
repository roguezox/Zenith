
'use client';

import * as React from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, FileText, Download, Trash2, Edit3 } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Expense, Category } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ExpensesPage() {
  const [initialExpensesArray] = React.useState<Expense[]>([]);
  const [initialCategoriesArray] = React.useState<Category[]>([]);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', initialExpensesArray);
  const [categories] = useLocalStorage<Category[]>('categories', initialCategoriesArray);
  const { toast } = useToast();
  const router = useRouter();

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      const expenseToDelete = expenses.find(exp => exp.id === expenseId);
      setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseId));
      if(expenseToDelete) {
        toast({ title: "Expense Deleted", description: `Expense "${expenseToDelete.description}" has been deleted.`, variant: "destructive" });
      }
    }
  };

  const handleEditExpense = (expenseId: string) => {
    router.push(`/expenses/edit/${expenseId}`);
  };
  
  const handleExportToCSV = () => {
    if (expenses.length === 0) {
      toast({ title: "No Data", description: "There are no expenses to export.", variant: "destructive" });
      return;
    }

    const csvHeader = "ID,Date,Category,Description,Amount\n";
    const csvRows = expenses.map(exp => 
      [
        exp.id,
        exp.date,
        getCategoryName(exp.categoryId).replace(/,/g, ''), // Remove commas from category name
        exp.description.replace(/,/g, ''), // Remove commas from description
        exp.amount
      ].join(',')
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'zenith_budget_expenses.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Export Successful", description: "Expenses exported to CSV."});
    } else {
       toast({ title: "Export Failed", description: "Your browser does not support this feature.", variant: "destructive" });
    }
  };

  // Sort expenses by date, most recent first
  const sortedExpenses = React.useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);


  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Track Expenses"
        description="Manage all your recorded expenses."
        icon={FileText}
        action={
          <div className="flex gap-2">
            <Button onClick={handleExportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button asChild>
              <Link href="/expenses/add">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Expense
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
           <CardDescription>
            {sortedExpenses.length > 0 
              ? `Showing all ${sortedExpenses.length} expense${sortedExpenses.length === 1 ? '' : 's'}.`
              : "You haven't recorded any expenses yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedExpenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                    <TableCell className="font-medium max-w-xs truncate" title={expense.description}>{expense.description}</TableCell>
                    <TableCell>{getCategoryName(expense.categoryId)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense.id)}>
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No expenses found.</p>
              <Button variant="link" className="mt-2" asChild>
                <Link href="/expenses/add">Add your first expense</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
