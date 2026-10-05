import { AIProvider } from "./IAIProvider";
import { OpenAICompatibleProvider } from "./OpenAIProvider";

export class AIProviderFactory {
  static getProvider(): AIProvider {
    // In the future, this can read from DB settings or env vars
    // e.g., const providerName = process.env.AI_PROVIDER || "openai";
    const providerName = (process.env.AI_PROVIDER || "openai").toLowerCase();

    switch (providerName) {
      case "anthropic":
        // return new AnthropicProvider(); // To be implemented
        throw new Error("Anthropic provider not yet implemented");
      case "google":
        // return new GoogleGeminiProvider(); // To be implemented
        throw new Error("Google provider not yet implemented");
      case "local":
      case "openai":
      default:
        // OpenAICompatibleProvider supports OpenAI, Local (Ollama, LM Studio), Azure, etc. via AI_BASE_URL
        return new OpenAICompatibleProvider();
    }
  }
}
