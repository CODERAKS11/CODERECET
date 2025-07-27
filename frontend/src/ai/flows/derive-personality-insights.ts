'use server';

/**
 * @fileOverview Derives potential personality insights from a set of sentences using AI.
 *
 * - derivePersonalityInsights - A function that takes an array of sentences and returns personality insights.
 * - DerivePersonalityInsightsInput - The input type for the derivePersonalityInsights function.
 * - DerivePersonalityInsightsOutput - The return type for the derivePersonalityInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DerivePersonalityInsightsInputSchema = z.object({
  sentences: z
    .array(z.string())
    .length(5)
    .describe('An array of five sentences provided by the user.'),
});
export type DerivePersonalityInsightsInput = z.infer<
  typeof DerivePersonalityInsightsInputSchema
>;

const DerivePersonalityInsightsOutputSchema = z.object({
  insights: z
    .string()
    .describe('Personality insights derived from the given sentences.'),
});
export type DerivePersonalityInsightsOutput = z.infer<
  typeof DerivePersonalityInsightsOutputSchema
>;

export async function derivePersonalityInsights(
  input: DerivePersonalityInsightsInput
): Promise<DerivePersonalityInsightsOutput> {
  return derivePersonalityInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'derivePersonalityInsightsPrompt',
  input: {schema: DerivePersonalityInsightsInputSchema},
  output: {schema: DerivePersonalityInsightsOutputSchema},
  prompt: `You are a psychologist analyzing personality traits.
  You will analyze a set of five sentences and derive potential personality insights.

  Sentences:
  {{#each sentences}}
  - {{{this}}}
  {{/each}}

  Based on these sentences, provide a summary of potential personality insights, including possible biases and attitudes.
  Be concise and insightful.`,
});

const derivePersonalityInsightsFlow = ai.defineFlow(
  {
    name: 'derivePersonalityInsightsFlow',
    inputSchema: DerivePersonalityInsightsInputSchema,
    outputSchema: DerivePersonalityInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
