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
  
  // Prioritized list of active models authorized on this Groq API key
  const defaultCandidates = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-20b",
  ];

  // Safely ignore compound/agentic models if set in .env
  const isCompound = envModel && (envModel.includes("compound") || envModel.includes("agent"));
  const validEnvModel = envModel && !isCompound ? envModel : undefined;

  const list = validEnvModel ? [validEnvModel, ...defaultCandidates] : defaultCandidates;
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
        maxOutputTokens: 1500,
        maxRetries: 0,
      });

      const reader = result.textStream.getReader();
      let buffer = "";
      let inThinkTag = false;

      const sanitizeChunk = (chunk: string): string => {
        buffer += chunk;
        let clean = "";

        while (buffer.length > 0) {
          if (inThinkTag) {
            const endIdx = buffer.indexOf("</think>");
            if (endIdx !== -1) {
              inThinkTag = false;
              buffer = buffer.substring(endIdx + 8);
            } else {
              const tagCheck = "</think>";
              let keepLen = 0;
              for (let i = 1; i < tagCheck.length; i++) {
                if (buffer.endsWith(tagCheck.substring(0, i))) {
                  keepLen = i;
                  break;
                }
              }
              buffer = buffer.substring(buffer.length - keepLen);
              break;
            }
          } else {
            const startIdx = buffer.indexOf("<think>");
            if (startIdx !== -1) {
              clean += buffer.substring(0, startIdx);
              inThinkTag = true;
              buffer = buffer.substring(startIdx + 7);
            } else {
              const tagCheck = "<think>";
              let keepLen = 0;
              for (let i = 1; i < tagCheck.length; i++) {
                if (buffer.endsWith(tagCheck.substring(0, i))) {
                  keepLen = i;
                  break;
                }
              }
              clean += buffer.substring(0, buffer.length - keepLen);
              buffer = buffer.substring(buffer.length - keepLen);
              break;
            }
          }
        }
        return clean;
      };

      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                // Flush remaining buffer if not in think tag
                if (!inThinkTag && buffer.length > 0) {
                  controller.enqueue(buffer);
                }
                break;
              }
              const cleanText = sanitizeChunk(value);
              if (cleanText) {
                controller.enqueue(cleanText);
                await new Promise((r) => setTimeout(r, 25));
              }
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

