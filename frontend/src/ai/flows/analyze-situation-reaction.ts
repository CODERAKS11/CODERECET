'use server';

/**
 * @fileOverview Analyzes a user's reaction to a given situation.
 *
 * - analyzeSituationReaction - A function that analyzes a reaction and provides a report.
 * - AnalyzeSituationReactionInput - The input type for the analyzeSituationReaction function.
 * - AnalyzeSituationReactionOutput - The return type for the analyzeSituationReaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSituationReactionInputSchema = z.object({
  situation: z.string().describe('The situation presented to the user.'),
  reaction: z.string().describe("The user's reaction to the situation."),
});
export type AnalyzeSituationReactionInput = z.infer<
  typeof AnalyzeSituationReactionInputSchema
>;

const AnalyzeSituationReactionOutputSchema = z.object({
  shortcomings: z
    .array(z.string())
    .describe('A list of potential shortcomings in the user\'s reaction.'),
  improvements: z
    .array(z.string())
    .describe('A list of constructive suggestions for improvement.'),
  rating: z.number().min(1).max(10).describe('A rating of the candidate\'s response on a scale of 1 to 10.')
});
export type AnalyzeSituationReactionOutput = z.infer<
  typeof AnalyzeSituationReactionOutputSchema
>;

export async function analyzeSituationReaction(
  input: AnalyzeSituationReactionInput
): Promise<AnalyzeSituationReactionOutput> {
   if (!input.reaction || input.reaction.trim() === '(No response)') {
    return {
      shortcomings: ['No response was provided in the given time.'],
      improvements: ['Responding within the time limit is crucial for assessment.'],
      rating: 1,
    };
  }
  return analyzeSituationReactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSituationReactionPrompt',
  input: {schema: AnalyzeSituationReactionInputSchema},
  output: {schema: AnalyzeSituationReactionOutputSchema},
  prompt: `You are a psychologist evaluating a candidate's response.
  Analyze the following candidate reaction to a given situation.
  Provide a detailed report that identifies potential shortcomings in the candidate's reaction and offers constructive feedback and suggestions for improvement.
  Finally, provide a rating of the candidate's response on a scale of 1 to 10, where 1 is poor and 10 is excellent.

  Situation: {{{situation}}}
  Candidate's Reaction: {{{reaction}}}

  Generate a list of shortcomings, a list of improvements, and a rating.`,
});

const analyzeSituationReactionFlow = ai.defineFlow(
  {
    name: 'analyzeSituationReactionFlow',
    inputSchema: AnalyzeSituationReactionInputSchema,
    outputSchema: AnalyzeSituationReactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
