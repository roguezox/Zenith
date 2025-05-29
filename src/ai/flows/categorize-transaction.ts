// This file is machine-generated - edit at your own risk.

'use server';
/**
 * @fileOverview Automatically suggests a spending category for a transaction based on its description.
 *
 * - smartCategorizeTransaction - A function that handles the transaction categorization process.
 * - SmartCategorizeTransactionInput - The input type for the smartCategorizeTransaction function.
 * - SmartCategorizeTransactionOutput - The return type for the smartCategorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartCategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction.'),
});
export type SmartCategorizeTransactionInput = z.infer<
  typeof SmartCategorizeTransactionInputSchema
>;

const SmartCategorizeTransactionOutputSchema = z.object({
  category: z.string().describe('The suggested category for the transaction.'),
});
export type SmartCategorizeTransactionOutput = z.infer<
  typeof SmartCategorizeTransactionOutputSchema
>;

export async function smartCategorizeTransaction(
  input: SmartCategorizeTransactionInput
): Promise<SmartCategorizeTransactionOutput> {
  return smartCategorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartCategorizeTransactionPrompt',
  input: {schema: SmartCategorizeTransactionInputSchema},
  output: {schema: SmartCategorizeTransactionOutputSchema},
  prompt: `Given the following transaction description, suggest a spending category.

Transaction Description: {{{transactionDescription}}}

Respond with only the category name, nothing else.  Possible categories include: Groceries, Restaurants, Utilities, Transportation, Entertainment, Shopping, Travel, and Other.`,
});

const smartCategorizeTransactionFlow = ai.defineFlow(
  {
    name: 'smartCategorizeTransactionFlow',
    inputSchema: SmartCategorizeTransactionInputSchema,
    outputSchema: SmartCategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
