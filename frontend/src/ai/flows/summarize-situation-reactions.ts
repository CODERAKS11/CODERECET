'use server';

/**
 * @fileOverview This file defines a Genkit flow that provides an overall summary and improvement suggestions based on an analysis of multiple situation-reaction pairs.
 *
 * @file summarizeSituationReactions - A Genkit flow to generate a summary and feedback.
 * @file SummarizeSituationReactionsInput - The input type for the summarizeSituationReactions flow.
 * @file SummarizeSituationReactionsOutput - The output type for the summarizeSituationReactions flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SituationAnalysisSchema = z.object({
  situation: z.string().describe('The situation presented.'),
  reaction: z.string().describe('The candidate\'s reaction.'),
  shortcomings: z.array(z.string()).describe('Identified shortcomings in the reaction.'),
  improvements: z.array(z.string()).describe('Suggestions for improvement.'),
  rating: z.number().describe('The rating given to the reaction.')
});

const SummarizeSituationReactionsInputSchema = z.object({
  analyses: z.array(SituationAnalysisSchema).describe('An array of situation reaction analyses.'),
});
export type SummarizeSituationReactionsInput = z.infer<typeof SummarizeSituationReactionsInputSchema>;

const SummarizeSituationReactionsOutputSchema = z.object({
  overallAnalysis: z.string().describe('A comprehensive overall analysis of the candidate\'s performance across all situations.'),
  overallImprovements: z.string().describe('A summary of key areas for improvement.'),
});
export type SummarizeSituationReactionsOutput = z.infer<typeof SummarizeSituationReactionsOutputSchema>;

export async function summarizeSituationReactions(input: SummarizeSituationReactionsInput): Promise<SummarizeSituationReactionsOutput> {
  return summarizeSituationReactionsFlow(input);
}

const summarizeSituationReactionsPrompt = ai.definePrompt({
  name: 'summarizeSituationReactionsPrompt',
  input: {schema: SummarizeSituationReactionsInputSchema},
  output: {schema: SummarizeSituationReactionsOutputSchema},
  prompt: `You are a senior psychologist providing a final evaluation of a candidate based on their reactions to a series of situations.

You have been provided with an analysis of five different situations. Based on this information, you need to generate:
1.  An "Overall Analysis": A comprehensive summary of the candidate's performance, highlighting patterns in their thinking and decision-making.
2.  An "Overall Improvements": A summarized list of the most critical areas where the candidate needs to improve.

Present both the analysis and improvements in a point-based format for clarity and impact. Be concise and professional.

Here are the individual analyses:
{{#each analyses}}
---
Situation: {{{this.situation}}}
Reaction: {{{this.reaction}}}
Rating: {{{this.rating}}}/10
Shortcomings:
{{#each this.shortcomings}}
- {{{this}}}
{{/each}}
Improvements:
{{#each this.improvements}}
- {{{this}}}
{{/each}}
---
{{/each}}
`,
});

const summarizeSituationReactionsFlow = ai.defineFlow(
  {
    name: 'summarizeSituationReactionsFlow',
    inputSchema: SummarizeSituationReactionsInputSchema,
    outputSchema: SummarizeSituationReactionsOutputSchema,
  },
  async input => {
    const {output} = await summarizeSituationReactionsPrompt(input);
    return output!;
  }
);
