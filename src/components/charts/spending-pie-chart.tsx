
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface SpendingPieChartProps {
  data: { name: string; value: number; fill: string }[];
}

// This chartConfig can be expanded if specific labels or icons are needed per category for the tooltip/legend.
// For now, ChartTooltipContent will use the 'name' and 'fill' from the data.
const chartConfig = {
  // Example: items: { label: "Items" }, // If dataKey was "items"
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
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Tooltip
                content={<ChartTooltipContent nameKey="name" />} // nameKey tells the tooltip which property in data holds the name
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Pie
                data={data}
                dataKey="value" // The key for the numerical value
                nameKey="name"   // The key for the name/label
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
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
