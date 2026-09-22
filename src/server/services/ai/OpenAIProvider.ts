import { AIProvider, AIProviderResponse } from "./IAIProvider";

export class OpenAICompatibleProvider implements AIProvider {
  name = "OpenAI-Compatible";
  
  private apiKey: string | undefined;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.model = process.env.AI_MODEL || "gpt-4-turbo";
    this.baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<AIProviderResponse> {
    if (!this.isConfigured()) {
      throw new Error("AI Copilot is not configured.");
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Provider Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
      tokensUsed: data.usage?.total_tokens,
    };
  }

  async stream(prompt: string, systemPrompt?: string, onChunk?: (chunk: string) => void): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("AI Copilot is not configured.");
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Provider Error: ${response.status}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split("\n").filter((line) => line.trim().startsWith("data: "));
        
        for (const line of lines) {
          const dataStr = line.replace("data: ", "").trim();
          if (dataStr === "[DONE]") continue;
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices[0]?.delta?.content;
            if (content && onChunk) {
              onChunk(content);
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }
  }

  async analyze(data: any, instructions: string): Promise<any> {
    const prompt = `${instructions}\n\nData:\n${JSON.stringify(data, null, 2)}`;
    const result = await this.generate(prompt, "You are an API expert analyzer. Return ONLY valid JSON as requested, with no markdown formatting or extra text.");
    
    try {
      let content = result.content.trim();
      if (content.startsWith("```json")) {
        content = content.substring(7, content.length - 3);
      }
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse AI JSON response:", result.content);
      throw new Error("AI returned invalid JSON formatting.");
    }
  }
}
