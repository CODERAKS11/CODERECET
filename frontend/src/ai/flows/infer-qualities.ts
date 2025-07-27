'use server';

/**
 * @fileOverview Infers qualities and related concepts from a list of sentences.
 *
 * - inferQualities - A function that takes an array of sentences and returns a list of inferred qualities and related concepts.
 * - InferQualitiesInput - The input type for the inferQualities function.
 * - InferQualitiesOutput - The return type for the inferQualities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InferQualitiesInputSchema = z.object({
  sentences: z.array(z.string()).length(5).describe('An array of five sentences provided by the user.'),
});
export type InferQualitiesInput = z.infer<typeof InferQualitiesInputSchema>;

const InferQualitiesOutputSchema = z.object({
  qualities: z.array(z.string()).describe('A list of inferred qualities and related concepts.'),
});
export type InferQualitiesOutput = z.infer<typeof InferQualitiesOutputSchema>;

export async function inferQualities(input: InferQualitiesInput): Promise<InferQualitiesOutput> {
  return inferQualitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inferQualitiesPrompt',
  input: {schema: InferQualitiesInputSchema},
  output: {schema: InferQualitiesOutputSchema},
  prompt: `You are an expert in linguistics and semantics. Analyze the following list of sentences and infer their qualities and related concepts. Provide a list of qualities and concepts associated with these sentences.\n\nSentences:\n{{#each sentences}}- {{{this}}}\n{{/each}}\n\nQualities and Concepts:`,
});

const inferQualitiesFlow = ai.defineFlow(
  {
    name: 'inferQualitiesFlow',
    inputSchema: InferQualitiesInputSchema,
    outputSchema: InferQualitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
