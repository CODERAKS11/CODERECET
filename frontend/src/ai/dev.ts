import { config } from 'dotenv';
config();
process.env.GEMINI_API_KEY = "AIzaSyBvkuUz2gxJrm6sYepaN6DsY1chulIwsTk";
'use server';



import '@/ai/flows/analyze-sentiment.ts';
import '@/ai/flows/derive-personality-insights.ts';
import '@/ai/flows/offer-tailored-feedback.ts';
import '@/ai/flows/infer-qualities.ts';
import '@/ai/flows/analyze-situation-reaction.ts';
import '@/ai/flows/analyze-word-association.ts';
import '@/ai/flows/summarize-situation-reactions.ts';
import '@/ai/flows/analyze-ppdt-image.ts';
import '@/ai/flows/analyze-ppdt-story.ts';
