'use server';
/**
 * @fileOverview Analyzes an image for a Picture Perception and Description Test (PPDT).
 */

import { ai } from '@/ai/genkit';
import media from "@genkit-ai/googleai"
import { z } from 'genkit';

// Input schema
const AnalyzePpdtImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .regex(/^data:image\/(jpeg|jpg|png);base64,/, {
      message: 'photoDataUri must be a valid Base64 image data URI (png/jpg/jpeg).',
    })
    .describe(
      'The PPDT image, as a Base64 data URI. Must include the MIME type and encoding, e.g., "data:image/jpeg;base64,..."'
    ),
});
export type AnalyzePpdtImageInput = z.infer<typeof AnalyzePpdtImageInputSchema>;

// Output schema
const AnalyzePpdtImageOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A detailed, objective analysis of the image content, presented in bullet points.'),
});
export type AnalyzePpdtImageOutput = z.infer<typeof AnalyzePpdtImageOutputSchema>;

// ✅ Correct prompt using media({ data })
// ...existing code...
const prompt = ai.definePrompt({
  name: 'analyzePpdtImagePrompt',
  input: { schema: AnalyzePpdtImageInputSchema },
  output: { schema: AnalyzePpdtImageOutputSchema },
  async prompt(input) {
    // Remove media usage, just use the data URI directly
    return `
You are an expert psychologist observing a PPDT image.
Provide a detailed and objective analysis of the image.
Describe the setting, characters, objects, and possible actions or moods depicted.
Present your analysis as a concise, point-based summary.

Photo: ${input.photoDataUri}
    `;
  },
});

// Flow
const analyzePpdtImageFlow = ai.defineFlow(
  {
    name: 'analyzePpdtImageFlow',
    inputSchema: AnalyzePpdtImageInputSchema,
    outputSchema: AnalyzePpdtImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

// Public function
export async function analyzePpdtImage(input: AnalyzePpdtImageInput): Promise<AnalyzePpdtImageOutput> {
  return await analyzePpdtImageFlow(input);
}
