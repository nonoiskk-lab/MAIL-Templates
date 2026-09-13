import OpenAI from "openai";
import type { AICompletionRequest, AIProvider } from "../types";
import { AIProviderError } from "../types";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete({ system, prompt, json, temperature = 0.6, maxTokens = 1200 }: AICompletionRequest) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature,
        max_tokens: maxTokens,
        response_format: json ? { type: "json_object" } : undefined,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenAI.");
      return content;
    } catch (error) {
      throw new AIProviderError("OpenAI request failed.", error);
    }
  }
}
