export interface AICompletionRequest {
  system: string;
  prompt: string;
  /** Hint to providers that support a native JSON response mode. */
  json: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  readonly name: string;
  /** Returns raw text output (expected to be a JSON string when json=true). */
  complete(request: AICompletionRequest): Promise<string>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
