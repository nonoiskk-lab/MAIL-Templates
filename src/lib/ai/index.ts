import type { AIProvider } from "./types";
import { AIProviderError } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";

export { AIProviderError };
export type { AIProvider };

let cachedProvider: AIProvider | null = null;

/**
 * Provider abstraction (spec §45): the rest of the app only ever talks to
 * `AIProvider`, so swapping OpenAI/Anthropic/Gemini is a one-line env change.
 */
export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const selected = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new AIProviderError(
      "AI is not configured. Set AI_PROVIDER and AI_API_KEY in your environment.",
    );
  }

  switch (selected) {
    case "anthropic":
      cachedProvider = new AnthropicProvider(apiKey, process.env.AI_MODEL);
      break;
    case "gemini":
      cachedProvider = new GeminiProvider(apiKey, process.env.AI_MODEL);
      break;
    case "openai":
    default:
      cachedProvider = new OpenAIProvider(apiKey, process.env.AI_MODEL);
      break;
  }

  return cachedProvider;
}

export function isAIConfigured() {
  return Boolean(process.env.AI_API_KEY);
}
