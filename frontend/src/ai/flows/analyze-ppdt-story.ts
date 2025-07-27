'use server';

/**
 * @fileOverview Analyzes a story written for a Picture Perception and Description Test (PPDT).
 *
 * - analyzePpdtStory - A function that analyzes a PPDT story.
 * - AnalyzePpdtStoryInput - The input type for the analyzePpdtStory function.
 * - AnalyzePpdtStoryOutput - The return type for the analyzePpdtStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CharacterSchema = z.object({
    gender: z.string().describe('The gender of the character.'),
    mood: z.string().describe('The perceived mood of the character (e.g., Positive, Negative, Neutral).')
});

const AnalyzePpdtStoryInputSchema = z.object({
  story: z.string().describe("The user's story based on the PPDT image."),
  characters: z.array(CharacterSchema).describe("Details of the characters perceived by the user.")
});
export type AnalyzePpdtStoryInput = z.infer<typeof AnalyzePpdtStoryInputSchema>;

const AnalyzePpdtStoryOutputSchema = z.object({
  thematicAnalysis: z.string().describe('An analysis of the main themes and underlying psychological currents of the story.'),
  plotSummary: z.string().describe('A brief summary of the story\'s plot.'),
  areasOfConcern: z
    .array(z.string())
    .describe('A list of potential psychological shortcomings or areas of concern revealed in the story.'),
  positiveQualities: z
    .array(z.string())
    .describe('A list of positive qualities and strengths demonstrated in the story.'),
});
export type AnalyzePpdtStoryOutput = z.infer<typeof AnalyzePpdtStoryOutputSchema>;

export async function analyzePpdtStory(
  input: AnalyzePpdtStoryInput
): Promise<AnalyzePpdtStoryOutput> {
  return analyzePpdtStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePpdtStoryPrompt',
  input: {schema: AnalyzePpdtStoryInputSchema},
  output: {schema: AnalyzePpdtStoryOutputSchema},
  prompt: `You are an expert psychologist evaluating a candidate's PPDT response.
  Analyze the candidate's story based on the characters they perceived.

  Perceived Characters:
  {{#each characters}}
  - Character: {{this.gender}}, Mood: {{this.mood}}
  {{/each}}

  Candidate's Story:
  "{{{story}}}"

  Based on this, provide the following in point-based format where applicable:
  1.  **Thematic Analysis**: What are the main themes (e.g., heroism, conflict, despair) and underlying psychological currents?
  2.  **Plot Summary**: A brief, one-sentence summary of the story's plot.
  3.  **Areas of Concern**: Identify potential psychological weaknesses, negative biases, or areas of concern.
  4.  **Positive Qualities**: Identify positive traits and strengths shown in the story, such as problem-solving, leadership, or courage.
  
  Be concise, insightful, and professional.`,
});

const analyzePpdtStoryFlow = ai.defineFlow(
  {
    name: 'analyzePpdtStoryFlow',
    inputSchema: AnalyzePpdtStoryInputSchema,
    outputSchema: AnalyzePpdtStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
