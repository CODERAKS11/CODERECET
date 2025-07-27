'use server';

/**
 * @fileOverview Analyzes the sentiment of five input sentences using AI.
 *
 * - analyzeSentiment - A function that analyzes the sentiment of five sentences.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInputSchema = z.object({
  sentence1: z.string().describe('The first sentence.'),
  sentence2: z.string().describe('The second sentence.'),
  sentence3: z.string().describe('The third sentence.'),
  sentence4: z.string().describe('The fourth sentence.'),
  sentence5: z.string().describe('The fifth sentence.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

const AnalyzeSentimentOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The overall sentiment of the five sentences (positive, negative, or neutral).'
    ),
});
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

export async function analyzeSentiment(input: AnalyzeSentimentInput): Promise<AnalyzeSentimentOutput> {
  return analyzeSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSentimentPrompt',
  input: {schema: AnalyzeSentimentInputSchema},
  output: {schema: AnalyzeSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following five sentences. Determine if the overall feeling is positive, negative, or neutral.

Sentence 1: {{{sentence1}}}
Sentence 2: {{{sentence2}}}
Sentence 3: {{{sentence3}}}
Sentence 4: {{{sentence4}}}
Sentence 5: {{{sentence5}}}

Overall Sentiment:`,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
