import Anthropic from "@anthropic-ai/sdk";
import type { AICompletionRequest, AIProvider } from "../types";
import { AIProviderError } from "../types";

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = "claude-sonnet-5") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete({ system, prompt, json, temperature = 0.6, maxTokens = 1200 }: AICompletionRequest) {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        system: json
          ? `${system}\n\nRespond with ONLY the JSON object, no markdown code fences, no commentary before or after it.`
          : system,
        messages: [{ role: "user", content: prompt }],
      });
      const block = response.content[0];
      const text = block && block.type === "text" ? block.text : "";
      if (!text) throw new Error("Empty response from Anthropic.");
      return json ? stripJsonFences(text) : text;
    } catch (error) {
      throw new AIProviderError("Anthropic request failed.", error);
    }
  }
}

function stripJsonFences(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenced ? fenced[1] : trimmed;
}
