'use server';
process.env.GEMINI_API_KEY = "AIzaSyBvkuUz2gxJrm6sYepaN6DsY1chulIwsTk";


import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';
import { derivePersonalityInsights } from '@/ai/flows/derive-personality-insights';
import { inferQualities } from '@/ai/flows/infer-qualities';
import { offerTailoredFeedback } from '@/ai/flows/offer-tailored-feedback';
import { analyzeSituationReaction, AnalyzeSituationReactionOutput } from '@/ai/flows/analyze-situation-reaction';
import { analyzeWordAssociation, AnalyzeWordAssociationOutput } from '@/ai/flows/analyze-word-association';
import { summarizeSituationReactions } from '@/ai/flows/summarize-situation-reactions';
import { analyzePpdtImage, AnalyzePpdtImageOutput } from '@/ai/flows/analyze-ppdt-image';
import { analyzePpdtStory, AnalyzePpdtStoryOutput } from '@/ai/flows/analyze-ppdt-story';


export type WordAnalysis = {
  word: string;
  sentence: string;
  report: AnalyzeWordAssociationOutput;
};

export type AnalysisResults = {
  wordAnalyses: WordAnalysis[];
  qualities: string[];
  sentiment: string;
  insights: string;
  feedback: string;
};

export type SituationAnalysis = {
  situation: string;
  reaction: string;
  report: AnalyzeSituationReactionOutput;
};

export type SituationAnalysisResult = {
  individualAnalyses: SituationAnalysis[];
  overallAnalysis: string;
  overallImprovements: string;
};

export type PPDTAnalysisResult = {
  imageAnalysis: AnalyzePpdtImageOutput;
  storyAnalysis: AnalyzePpdtStoryOutput;
};


export async function getAnalysis(
  sentences: { word: string; value: string }[]
): Promise<AnalysisResults | { error: string }> {
  if (sentences.length !== 5) {
    return { error: 'Exactly five sentences are required.' };
  }

  // Check if any sentence is empty, which can happen with the timer.
  const validSentences = sentences.filter(s => s.value.trim() !== '');
  if (validSentences.length === 0) {
      return { error: 'At least one sentence is required to generate a report.' };
  }

  try {
    const sentenceValues = sentences.map(s => s.value);
    const sentencesObject = {
      sentence1: sentenceValues[0] || " ",
      sentence2: sentenceValues[1] || " ",
      sentence3: sentenceValues[2] || " ",
      sentence4: sentenceValues[3] || " ",
      sentence5: sentenceValues[4] || " ",
    };

    const wordAnalysisPromises = sentences.map(s => analyzeWordAssociation({ word: s.word, sentence: s.value || "(No response)" }));
    const wordAnalysesResults = await Promise.all(wordAnalysisPromises);
    const wordAnalyses: WordAnalysis[] = sentences.map((s, i) => ({
      word: s.word,
      sentence: s.value || "(No response)",
      report: wordAnalysesResults[i],
    }));

    const [sentimentResult, qualitiesResult, insightsResult] = await Promise.all([
      analyzeSentiment(sentencesObject),
      inferQualities({ sentences: sentenceValues.map(s => s || " ") }),
      derivePersonalityInsights({ sentences: sentenceValues.map(s => s || " ") }),
    ]);

    const feedbackResult = await offerTailoredFeedback({
      sentences: sentenceValues.map(s => s || " "),
      inferredQualities: qualitiesResult.qualities.join(', '),
      sentimentAnalysis: sentimentResult.sentiment,
      personalityInsights: insightsResult.insights,
    });

    return {
      wordAnalyses,
      qualities: qualitiesResult.qualities,
      sentiment: sentimentResult.sentiment,
      insights: insightsResult.insights,
      feedback: feedbackResult.tailoredFeedback,
    };
  } catch (e) {
    console.error('Error during AI analysis:', e);
    return { error: 'An unexpected error occurred while generating your report. Please try again.' };
  }
}

export async function getSituationAnalysis(
  reactions: { situation: string; reaction: string }[]
): Promise<SituationAnalysisResult | { error: string }> {
  if (reactions.length !== 5) {
    return { error: 'Exactly five reactions are required.' };
  }

  const validReactions = reactions.filter(r => r.reaction.trim() !== '');
  if (validReactions.length === 0) {
      return { error: 'At least one reaction is required to generate a report.' };
  }


  try {
    const analysisPromises = reactions.map(reaction => analyzeSituationReaction({situation: reaction.situation, reaction: reaction.reaction || "(No response)"}));
    const individualReports = await Promise.all(analysisPromises);
    
    const individualAnalyses: SituationAnalysis[] = reactions.map((r, i) => ({
      situation: r.situation,
      reaction: r.reaction || "(No response)",
      report: individualReports[i],
    }));

    const summaryResult = await summarizeSituationReactions({
        analyses: individualAnalyses.map(a => ({
            ...a.report,
            situation: a.situation,
            reaction: a.reaction,
        })),
    });

    return {
      individualAnalyses,
      overallAnalysis: summaryResult.overallAnalysis,
      overallImprovements: summaryResult.overallImprovements,
    };

  } catch (e) {
    console.error('Error during situation analysis:', e);
    return { error: 'An unexpected error occurred while generating your report. Please try again.' };
  }
}

export async function getPPDTAnalysis(
  imageDataUri: string,
  story: string,
  characters: { gender: string; mood: string }[]
): Promise<PPDTAnalysisResult | { error: string }> {
  if (!story || story.trim().length === 0) {
    return { error: 'A story is required to generate a report.' };
  }
  if (!imageDataUri) {
    return { error: 'Image data is missing.' };
  }

  try {
    const [imageAnalysis, storyAnalysis] = await Promise.all([
      analyzePpdtImage({ photoDataUri: imageDataUri }),
      analyzePpdtStory({ story, characters }),
    ]);

    return {
      imageAnalysis,
      storyAnalysis,
    };
  } catch (e) {
    console.error('Error during PPDT analysis:', e);
    return { error: 'An unexpected error occurred while generating your PPDT report. Please try again.' };
  }
}
