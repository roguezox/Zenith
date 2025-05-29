
'use client';

import * as React from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Tags, Trash2, Edit3 } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Category } from '@/types';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const categorySchema = z.object({
  name: z.string().min(1, { message: "Category name cannot be empty." }).max(50, { message: "Category name too long." }),
});
type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [initialCategoriesArray] = React.useState<Category[]>([]);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', initialCategoriesArray);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  React.useEffect(() => {
    if (editingCategory) {
      form.reset({ name: editingCategory.name });
    } else {
      form.reset({ name: '' });
    }
  }, [editingCategory, form, isDialogOpen]);

  const handleAddOrUpdateCategory: SubmitHandler<CategoryFormData> = (data) => {
    if (editingCategory) {
      // Update existing category
      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat.id === editingCategory.id ? { ...cat, name: data.name } : cat
        )
      );
      toast({ title: "Category Updated", description: `"${data.name}" has been updated.` });
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(), // Simple unique ID
        name: data.name,
      };
      setCategories(prevCategories => [...prevCategories, newCategory]);
      toast({ title: "Category Added", description: `"${data.name}" has been added.` });
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Basic confirmation, ideally use an AlertDialog for better UX
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      const categoryToDelete = categories.find(cat => cat.id === categoryId);
      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
      if (categoryToDelete) {
        toast({ title: "Category Deleted", description: `"${categoryToDelete.name}" has been deleted.`, variant: "destructive" });
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Manage Categories"
        description="Add, edit, or remove your spending categories."
        icon={Tags}
        action={
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCategory(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingCategory(null); form.reset(); setIsDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? 'Update the name of your category.' : 'Enter a name for your new spending category.'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddOrUpdateCategory)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Groceries, Utilities" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                       <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">{editingCategory ? 'Save Changes' : 'Add Category'}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Your Categories</CardTitle>
          <CardDescription>
            {categories.length > 0 
              ? `You currently have ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}.`
              : "You haven't added any categories yet. Add one to get started!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)} className="text-destructive hover:text-destructive">
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
              <Tags className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No categories found.</p>
              <Button variant="link" className="mt-2" onClick={() => setIsDialogOpen(true)}>
                Add your first category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
