'use server';

/**
 * @fileOverview Provides pronunciation feedback on spoken words or phrases.
 *
 * - getPronunciationFeedback - A function that takes audio data and text and returns pronunciation feedback.
 * - PronunciationFeedbackInput - The input type for the getPronunciationFeedback function.
 * - PronunciationFeedbackOutput - The return type for the getPronunciationFeedback function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PronunciationFeedbackInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'Audio data of the user speaking, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  text: z.string().describe('The word or phrase the user is attempting to pronounce.'),
});
export type PronunciationFeedbackInput = z.infer<typeof PronunciationFeedbackInputSchema>;

const PronunciationFeedbackOutputSchema = z.object({
  feedback: z.string().describe('AI feedback on the user’s pronunciation.'),
});
export type PronunciationFeedbackOutput = z.infer<typeof PronunciationFeedbackOutputSchema>;

export async function getPronunciationFeedback(input: PronunciationFeedbackInput): Promise<PronunciationFeedbackOutput> {
  return pronunciationFeedbackFlow(input);
}

const pronunciationFeedbackPrompt = ai.definePrompt({
  name: 'pronunciationFeedbackPrompt',
  input: {
    schema: z.object({
      audioDataUri: z
        .string()
        .describe(
          'Audio data of the user speaking, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
        ),
      text: z.string().describe('The word or phrase the user is attempting to pronounce.'),
    }),
  },
  output: {
    schema: z.object({
      feedback: z.string().describe('AI feedback on the user’s pronunciation.'),
    }),
  },
  prompt: `You are an AI language tutor, expert at providing feedback on pronunciation.

You will be given an audio recording of a user attempting to pronounce a word or phrase, along with the text of the word or phrase itself. You will analyze the user's pronunciation and provide feedback to help them improve.

Phrase: {{{text}}}
Audio: {{media url=audioDataUri}}

Feedback: `,
});

const pronunciationFeedbackFlow = ai.defineFlow<
  typeof PronunciationFeedbackInputSchema,
  typeof PronunciationFeedbackOutputSchema
>({
  name: 'pronunciationFeedbackFlow',
  inputSchema: PronunciationFeedbackInputSchema,
  outputSchema: PronunciationFeedbackOutputSchema,
},
async input => {
  const {output} = await pronunciationFeedbackPrompt(input);
  return output!;
});
