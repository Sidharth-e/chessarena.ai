export const PROVIDERS = ["Human", "OpenAI", "Anthropic", "Gemini", "Azure", "Grok", "Perplexity"];

export const MODELS: Record<string, string[]> = {
  "OpenAI": ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"],
  "Anthropic": ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
  "Gemini": ["gemini-3.1-pro-preview", "gemini-3-flash-preview", "gemini-3.1-flash-lite-preview", "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"],
  "Azure": ["gpt-4", "gpt-35-turbo"],
  "Grok": ["grok-1", "grok-1.5"],
  "Perplexity": ["llama-3-sonar-large-32k-chat", "llama-3-sonar-small-32k-chat"]
};

export interface PlayerConfig {
  provider: string;
  model: string;
}

export const DEFAULT_CONFIG: { white: PlayerConfig; black: PlayerConfig } = {
  white: { provider: "Human", model: "" },
  black: { provider: "OpenAI", model: "gpt-4o" }
};
