import { createGroq } from "@ai-sdk/groq";
import { createTextStreamResponse, generateText, streamText } from "ai";
import type { ModelMessage } from "ai";
import { logWarn, reportError } from "./logger";

/**
 * List of fallback models for Groq AI service.
 * If GROQ_MODEL environment variable is specified, it will be tried first.
 */
function getModelCandidates(): string[] {
  const envModel = process.env.GROQ_MODEL?.trim();
  const defaultCandidates = [
    "groq/compound",
    "groq/compound-mini",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ];

  const list = envModel ? [envModel, ...defaultCandidates] : defaultCandidates;
  return Array.from(new Set(list));
}

function getGroqModel(modelName: string) {
  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });
  return groq(modelName);
}

/**
 * Generate text using Groq with dynamic fallback.
 * Used for structured outputs like recommendations and insights.
 */
export async function generateAIText(
  prompt: string,
  system: string
): Promise<string> {
  const candidates = getModelCandidates();
  let lastError: unknown = null;

  for (const modelName of candidates) {
    try {
      const model = getGroqModel(modelName);
      const { text } = await generateText({
        model,
        system,
        prompt,
        maxOutputTokens: 500,
      });
      return text;
    } catch (err: any) {
      lastError = err;
      logWarn("ai_model_fallback_triggered", {
        attemptedModel: modelName,
        error: err?.message || String(err),
      });
    }
  }

  reportError(lastError, { flow: "generateAIText", modelsTried: candidates });
  return "AI insights are currently unavailable. Please try again shortly.";
}

/**
 * Stream chat text using Groq with dynamic fallback.
 * Used for the AI chat assistant.
 */
export async function streamAIChat(
  messages: ModelMessage[],
  system: string
) {
  const candidates = getModelCandidates();
  let lastError: unknown = null;

  for (const modelName of candidates) {
    try {
      const model = getGroqModel(modelName);
      const result = streamText({
        model,
        system,
        messages,
        maxOutputTokens: 800,
        maxRetries: 0,
      });

      const reader = result.textStream.getReader();
      const firstChunk = await reader.read();

      if (firstChunk.done) {
        continue;
      }

      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(firstChunk.value);
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return createTextStreamResponse({ textStream: stream });
    } catch (err: any) {
      lastError = err;
      logWarn("ai_stream_model_failed", {
        attemptedModel: modelName,
        error: err?.message || String(err),
      });
    }
  }

  reportError(lastError, { flow: "streamAIChat", modelsTried: candidates });

  const fallbackText =
    "Amortix AI is currently updating its models and is temporarily unavailable. Please try your request again in a few moments.";
  const fallbackStream = new ReadableStream({
    start(controller) {
      controller.enqueue(fallbackText);
      controller.close();
    },
  });

  return createTextStreamResponse({ textStream: fallbackStream });
}

