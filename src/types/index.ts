export interface Category {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  date: string; // ISO string format YYYY-MM-DD
  categoryId: string;
  amount: number;
  description: string;
}

export interface BudgetGoal {
  // For simplicity, we'll use a single overall monthly goal.
  // The key for localStorage could be e.g., "budgetGoal-YYYY-MM"
  // Or store a list of goals if multiple are needed.
  // For this iteration, let's assume one primary goal.
  amount: number; 
}
