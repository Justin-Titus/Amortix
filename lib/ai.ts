import { createGroq } from "@ai-sdk/groq";
import { createTextStreamResponse, generateText, streamText } from "ai";
import type { ModelMessage } from "ai";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})("llama-3.1-8b-instant");

/**
 * Generate text using the Groq model.
 * Used for structured outputs like recommendations and insights.
 */
export async function generateAIText(
  prompt: string,
  system: string
): Promise<string> {
  const { text } = await generateText({
    model: groq,
    system,
    prompt,
    maxOutputTokens: 500,
  });
  return text;
}

/**
 * Stream chat text using the Groq model.
 * Used for the AI chat assistant.
 */
export async function streamAIChat(
  messages: ModelMessage[],
  system: string
) {
  const result = streamText({
    model: groq,
    system,
    messages,
    maxOutputTokens: 800,
    maxRetries: 0,
  });

  return createTextStreamResponse({ textStream: result.textStream });
}
