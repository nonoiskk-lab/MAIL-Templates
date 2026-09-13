import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AICompletionRequest, AIProvider } from "../types";
import { AIProviderError } from "../types";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-1.5-flash") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async complete({ system, prompt, json, temperature = 0.6, maxTokens = 1200 }: AICompletionRequest) {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: system,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: json ? "application/json" : "text/plain",
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) throw new Error("Empty response from Gemini.");
      return text;
    } catch (error) {
      throw new AIProviderError("Gemini request failed.", error);
    }
  }
}
