'use server';

/**
 * @fileOverview Analyzes a user's association with a given word.
 *
 * - analyzeWordAssociation - A function that analyzes a sentence associated with a word and provides a report.
 * - AnalyzeWordAssociationInput - The input type for the analyzeWordAssociation function.
 * - AnalyzeWordAssociationOutput - The return type for the analyzeWordAssociation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeWordAssociationInputSchema = z.object({
  word: z.string().describe('The word presented to the user.'),
  sentence: z.string().describe("The user's sentence associated with the word."),
});
export type AnalyzeWordAssociationInput = z.infer<
  typeof AnalyzeWordAssociationInputSchema
>;

const AnalyzeWordAssociationOutputSchema = z.object({
  sentiment: z.string().describe('The sentiment of the sentence (e.g., Positive, Negative, Neutral).'),
  emotion: z.string().describe('The dominant emotion conveyed in the sentence (e.g., Joy, Sadness, Anger).'),
  shortcomings: z
    .array(z.string())
    .describe('A list of potential shortcomings in the user\'s sentence.'),
  improvements: z
    .array(z.string())
    .describe('A list of constructive suggestions for improvement.'),
});
export type AnalyzeWordAssociationOutput = z.infer<
  typeof AnalyzeWordAssociationOutputSchema
>;

export async function analyzeWordAssociation(
  input: AnalyzeWordAssociationInput
): Promise<AnalyzeWordAssociationOutput> {
  // If the sentence is empty, return a default response.
  if (!input.sentence || input.sentence.trim() === '(No response)') {
    return {
      sentiment: 'Neutral',
      emotion: 'None',
      shortcomings: ['No response was provided in the given time.'],
      improvements: ['Try to provide a response within the time limit to allow for a full analysis.'],
    };
  }
  return analyzeWordAssociationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWordAssociationPrompt',
  input: {schema: AnalyzeWordAssociationInputSchema},
  output: {schema: AnalyzeWordAssociationOutputSchema},
  prompt: `You are a psychologist evaluating a candidate's response.
  Analyze the following candidate's sentence in response to a given word.
  Determine the sentiment (e.g., Positive, Negative, Neutral) and the dominant emotion (e.g., Joy, Sadness, Anger) in one word each.
  Provide a brief and compact report that identifies potential shortcomings in the candidate's thinking and offers constructive feedback and suggestions for improvement.
  Present the feedback in concise points. The feedback should be short and to the point.

  Word: {{{word}}}
  Candidate's Sentence: {{{sentence}}}

  Generate a sentiment, an emotion, a list of shortcomings, and a list of improvements.`,
});

const analyzeWordAssociationFlow = ai.defineFlow(
  {
    name: 'analyzeWordAssociationFlow',
    inputSchema: AnalyzeWordAssociationInputSchema,
    outputSchema: AnalyzeWordAssociationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
