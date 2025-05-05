export interface ApiClientConfig {
  baseUrl: string;
  revalidationTime?: number;
}

export abstract class BaseApiClient {
  protected baseUrl: string;
  protected revalidationTime: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl || '';
    this.revalidationTime = config.revalidationTime || 3600;
  }

  protected async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  protected async fetchRaw(endpoint: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response;
  }

}