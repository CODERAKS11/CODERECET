import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: 'AIzaSyBvkuUz2gxJrm6sYepaN6DsY1chulIwsTk', // ✅ Hardcoded here
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
