# Zenith Budget

A modern, AI-powered expense tracker designed for clarity, efficiency, and a beautiful user experience.

---

## Dashboard Overview

Your financial summary and insights.

- **Total Spending (This Month):** ₹600.00
- **Remaining Budget (This Month):** ₹74,400.00  
  *Goal: ₹75,000.00*
- **Active Categories:** 2

---

### Visualizations

- **Spending by Category:**  
  Monthly spending breakdown per category.

- **Spending Distribution:**  
  Overall spending distribution across categories.

---

## Features

- **Dashboard Overview**
  - Key financial summaries for the current month
  - Visual breakdowns: bar chart & pie chart
  - Recent transactions and quick expense entry

- **Expense Management**
  - Add, edit, delete, and view all expenses
  - AI-powered category suggestions (Genkit)
  - Export expenses as CSV

- **Category Management**
  - Add, edit, and delete custom categories

- **Budget Goal Setting**
  - Set, track, and edit monthly budget goals
  - Visual progress bar for budget usage

- **User Interface & Experience**
  - Responsive, dark-themed design
  - Modern UI with ShadCN UI + Tailwind CSS
  - Sidebar navigation for Dashboard, Expenses, Categories, Goals
  - Toast notifications for user feedback
  - Efficient forms (react-hook-form + zod)
  - Local storage for all data

- **Technical & AI Features**
  - Next.js App Router
  - TypeScript codebase
  - Genkit for smart category suggestions
  - Firebase setup (Auth, Firestore) included (optional backend)
  - Standalone Next.js output, Dockerfile, and apphosting.yaml for deployment

---

## Quick Start

1. **Clone & Install**
    ```
    git clone https://github.com/your-username/zenith-budget.git
    cd zenith-budget
    npm install
    ```

2. **Run Locally**
    ```
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

| Technology      | Purpose                                   |
|-----------------|-------------------------------------------|
| Next.js         | App framework & routing                   |
| TypeScript      | Type safety and maintainability           |
| Tailwind CSS    | Utility-first styling                     |
| ShadCN UI       | Modern UI components                      |
| React Hook Form | Efficient form handling                   |
| zod             | Schema validation                         |
| Genkit          | AI-powered category suggestions           |
| Firebase (opt.) | Auth & Firestore (setup included)         |
| Docker          | Containerization for deployment           |

---

> **Zenith Budget** – Your finances, beautifully organized.
