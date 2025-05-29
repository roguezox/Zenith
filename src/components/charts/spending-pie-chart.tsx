'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'; // Use shadcn's ChartTooltipContent

interface SpendingPieChartProps {
  data: { name: string; value: number; fill: string }[];
}

const chartConfig = {
  // Dynamic keys based on data, e.g. 'groceries', 'utilities'
} satisfies ChartConfig;


export function SpendingPieChart({ data }: SpendingPieChartProps) {
   if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Distribution</CardTitle>
          <CardDescription>No spending data available to show distribution.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No data to display.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Distribution</CardTitle>
        <CardDescription>Overall spending distribution across categories.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Tooltip
              content={<ChartTooltipContent nameKey="name" />}
              cursor={{ fill: "hsl(var(--muted))" }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
