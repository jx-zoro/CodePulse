export interface AIProviderResponse {
  content: string;
  tokensUsed?: number;
}

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  generate(prompt: string, systemPrompt?: string): Promise<AIProviderResponse>;
  stream(prompt: string, systemPrompt?: string, onChunk?: (chunk: string) => void): Promise<void>;
  analyze(data: any, instructions: string): Promise<any>;
}
